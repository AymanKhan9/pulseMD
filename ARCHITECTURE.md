# PulseMD Architecture

PulseMD is a healthcare platform where patients find doctors, book and pay for appointments, and receive prescriptions, and where doctors manage their appointments and patients. It is a two-process JavaScript app in one repository: a React single-page app and an Express API backed by MongoDB.

```
 Browser (React SPA, CRA)  ──HTTPS/JSON, Bearer JWT──▶  Express API (backend/index.js, :3001)
   │   │                                                    │        │         │
   │   └─ Google Identity (ID token) ──▶ /auth/google ──────┤        │         └─▶ Nodemailer (Gmail SMTP)
   │                                                        ▼        └─▶ Stripe (Checkout + webhook)
   └─ redirected to Stripe Checkout                  MongoDB (db "users")
```

## Repository layout

| Path | Purpose |
|---|---|
| `src/` | React frontend (Create React App, MUI + Tailwind) |
| `backend/` | Express API (CommonJS) |
| `public/` | CRA static assets and `index.html` |
| `render.yaml` | Render.com deployment blueprint for the backend |
| `package.json` | Single manifest for both frontend and backend dependencies |

Scripts: `npm start` (frontend dev server, :3000), `npm run build` (production frontend build), `npm run dev` (`node backend/index.js`), `npm test` (react-scripts/Jest; there are no automated tests in the repo today).

## Backend (`backend/`)

### Bootstrap (`index.js`)
1. CORS limited to `FRONTEND_URL` (default `http://localhost:3000`), methods GET/POST/PUT/DELETE.
2. `POST /payment/webhook` is registered **before** `express.json()` with `express.raw()`, because Stripe signature verification needs the unparsed body.
3. `express.json()` and `cookie-parser`, then the routers below.
4. `connectDB()` runs; only after it succeeds is the native `Db` stored in `app.locals.db` and the server started on port 3001 (hard-coded). A connection failure exits the process.

### Data access
`configs/mongodbConfig.js` opens one Mongoose connection to database `users` (via `MONGO_URI`) and returns the underlying native `Db`. Two styles coexist:

- **Mongoose models** (`models/doctorModel.js`, `patientModel.js`) for the `doctor` and `patient` collections; used by `authController`.
- **Raw driver calls** via `req.app.locals.db.collection(...)` for `appointments` and for the query routes.

Collections:
- `patient`: email (unique), bcrypt password, role, fullname, image, gender, address, age, bloodgroup, `isverified`, `emailVerified`.
- `doctor`: the common fields plus degree, speciality, regno, regyear, experience, starttime, endtime. `isverified` appears to mark admin-approved doctors (see `getVerifiedDocuments`), while `emailVerified` tracks email confirmation.
- `appointments` (no schema; created by the client payload): doctor/patient ids and names, date, symptoms, `isConfirmed`, `prescriptions`, `paymentStatus` (`pending` → `paid`), `stripePaymentIntentId`.

### Authentication and authorization
- **Password login** (`POST /auth/login`): looks up the user in the role's collection, compares with bcrypt (`utils/bcrypt-hashing.js`), rejects unverified emails (403), returns the user and a 7-day JWT `{email, role}` signed with `JWT_SECRET`.
- **Signup** (`POST /auth/signup`): creates the user with role-specific blank fields and sends a verification email containing a 1-day JWT signed with `EMAIL_TOKEN_SECRET` (`utils/mailer.js`, Gmail via `EMAIL_USER`/`EMAIL_PASS`; the link points to `REACT_APP_API_URL/auth/verify-email`).
- **Email verification**: `GET /auth/verify-email` sets `emailVerified` and redirects to `FRONTEND_URL/Register?verified=success|failed`. `POST /auth/resend-verification` re-sends the link.
- **Google sign-in** (`POST /auth/google`): verifies the Google ID token with `google-auth-library` against `GOOGLE_CLIENT_ID`, then logs in or creates the user and issues the same JWT.
- **`middleware/authMiddleware.js`**: requires `Authorization: Bearer <jwt>`, verifies it, sets `req.user`. It is applied to every router except the public auth endpoints (login, signup, google, verify-email, resend-verification). It authenticates but does not check roles or that the caller owns the resource named in the request body.

### Routes

| Mount | Endpoint | Auth | Purpose |
|---|---|---|---|
| `/auth` | `POST /login`, `/signup`, `/google`, `/resend-verification`; `GET /verify-email` | public | Registration and login |
| `/auth` | `POST /change-password`, `POST /updateProfile`, `DELETE /delete` | JWT | Account management |
| `/appointment` | `POST /book` | JWT | Insert appointment with `paymentStatus: "pending"` |
| `/appointment` | `POST /get` | JWT | Appointments for the current user |
| `/appointment` | `POST /accept` | JWT | Doctor confirms; refused (400) unless paid |
| `/appointment` | `DELETE /reject` | JWT | Cancel/reject an appointment |
| `/appointment` | `POST /prescriptions` | JWT | Doctor writes prescriptions onto an appointment |
| `/payment` | `POST /create-checkout-session` | JWT | Creates a Stripe Checkout session (fixed $50 fee, `CONSULTATION_FEE_CENTS`) and returns `checkoutUrl` |
| `/payment` | `POST /webhook` | Stripe signature | On `checkout.session.completed`, marks the appointment `paid` |
| `/getVerifiedDocuments` | `POST /` | JWT | List verified doctors (patient "Find Doctors") |
| `/fetchUser` | `POST /` | JWT | Reload the current user's document |
| `/yourpatients` | `POST /` | JWT | A doctor's confirmed patients |

`backend/queries/` holds the read-only lookup routers; `backend/utils/queryOneDoc.js` is a helper. `backend/tests/` contains manual seed scripts (`insertDoctor.js`, `insertPatient.js`, `getaptdoc.js`) and raw data, not an automated test suite.

### Booking and payment flow
1. Patient picks a doctor and slot (`BookAppointment.jsx`) → `POST /appointment/book` (status `pending`).
2. Client calls `POST /payment/create-checkout-session` with the `appointmentId` and redirects the browser to Stripe.
3. Stripe calls `/payment/webhook`; the signature is verified and the appointment becomes `paid`. Stripe then returns the user to `FRONTEND_URL/dashboard?payment=success|cancelled`, which `Dashboard.jsx` turns into a toast.
4. The doctor can accept only paid appointments (`/appointment/accept`), then add prescriptions (`/appointment/prescriptions`).

## Frontend (`src/`)

- **Entry**: `index.js` mounts `App.jsx` inside the router. `App` initialises AOS animations and wraps everything in `AuthProvider` → `DataProvider`, with a global `ToastContainer`.
- **State** (React Context, no Redux):
  - `store/AuthProvider.jsx`: `currentUser`, edit mode, and all auth actions (login, Google auth, signup, logout, delete account, change password, save profile). On login it stores `currentUser` and `authToken` in `sessionStorage` and sets the axios default `Authorization: Bearer` header; on load it restores both.
  - `store/DataProvider.jsx`: fetches and caches the verified-doctor list, the user's appointments, and a doctor's patients.
- **Routing** (`react-router-dom` v6): `routes/PublicRoutes` (only when logged out, redirects to `/`) wraps `/Register` (Login / Signup); `routes/PrivateRoutes` (only when logged in, redirects to `/Register`) wraps `/dashboard`, `/find-doctors`, `/your-patients`. `/` (Home) and `/our-team` are available to everyone through `pages/Public/Layout` (Navbar + Footer + Outlet). Route guarding is client-side only; the real enforcement is the JWT check on the API.
- **Pages**:
  - `pages/Public/`: Home (with category slider), About Us, Our Team, Register (Login, SignUp, Slideshow), Layout.
  - `pages/Dashboard/`: tabbed Dashboard with MyProfile, ScheduledMeetings, Prescriptions (patients only), plus change-password and delete-account dialogs.
  - `pages/patients/`: FindDoc, BookAppointment (and older Patient login/signup, now commented out in `App.jsx`).
  - `pages/doctor/`: YourPatients, Prescribe (and older DocLogin/DocSignup, also unused).
- **Components**: `Navbar`, `Footer`, `GoogleAuthButton` (Google Identity Services, uses `REACT_APP_GOOGLE_CLIENT_ID`).
- **Styling/UI**: Material UI, Tailwind (`tailwind.config.js`), `react-slick` carousels, `react-toastify` notifications, `dayjs`/`date-fns` and MUI date pickers.
- The client calls the API with `axios` at `process.env.REACT_APP_API_URL`.

## Configuration

| Variable | Used by | Meaning |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string (no db name; code selects `users`) |
| `FRONTEND_URL` | backend | CORS origin and redirect target |
| `REACT_APP_API_URL` | frontend and backend | Public base URL of the API (the backend also uses it to build the email verification link) |
| `REACT_APP_GOOGLE_CLIENT_ID` | frontend | Google OAuth client id |
| `GOOGLE_CLIENT_ID` | backend | Audience for ID-token verification |
| `JWT_SECRET`, `EMAIL_TOKEN_SECRET` | backend | Signing keys for session and email-verification tokens |
| `EMAIL_USER`, `EMAIL_PASS` | backend | Gmail SMTP credentials |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | backend | Stripe API and webhook signing |

`.env` is loaded with `dotenv` from the process working directory.

## Deployment
`render.yaml` defines one Render web service (`pulsemd-backend`: `npm install`, `node backend/index.js`) with the variables above set as secrets. The frontend is built with `npm run build` and must be hosted separately (static host) with `REACT_APP_API_URL` set at build time.

## Known caveats
- `package.json` lists unused or overlapping dependencies (`resend`, `zod`, `mongod`, `date`); the mailer uses Nodemailer.
- The listening port is hard-coded to 3001 rather than read from `PORT`, which some hosts (including Render) expect.
- Several appointment/query endpoints trust identifiers in the request body (e.g. `currentUser`, `doctor_id`) instead of `req.user`.
- `handleDeleteAccount` does not clear the auth token from `sessionStorage`.
- Large blocks of commented-out mock data remain in the providers and `App.jsx`.
