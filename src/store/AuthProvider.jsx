import { useContext,createContext } from "react";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import pf1 from '../images/test-1.jpg'
import doc_1 from '../images/doc-prof-1.jpg'
import axios from 'axios';

export const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({children}){
    /*const [currentUser, setCurrentuser] = useState(
        {id:10, 
        email:'john@gmail.com',
        password:'john1234',
        fullname:'John Doe', 
        image: pf1,
        age:'30',
        gender:'Male',
        bloodgroup:'A+',
        address:'123 Baker Street',
        role:'patient', 
        isverified:true})*/

    /*const [currentUser, setCurrentuser] = useState(
        {id:'1',
        email:'mark@gmail.com',
        password:'mark1234',
        fullname:'Mark Doe',
        image: doc_1,
        age:'55',
        gender:'Male',
        address:'123 Baker Street',
        role:'doctor',
        degree:'MBBS, MD',
        speciality: 'Pediatrician',
        regno:'12345678',
        regyear:'1998',
        experience: '15',
        starttime: '09:00',
        endtime: '17:00',
        isverified:true})*/

    const [currentUser, setCurrentuser] = useState('')
    const [userRole, setUserRole] = useState('')

    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate() 

    //USER LOGIN/LOGOUT SIGNIN/SIGNOUT

    const handleSignup = async (name,email,password,role) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, {
              role,
              name,
              email,
              password,
            });
      
            console.log(response.data); // Successful registration message
            navigate('/Register')
            toast.success("Signed up! Check your email to verify your account before logging in.")
          } catch (error) {
            console.log(role);
            console.error('Signup error:', error.response.data.message);
            toast.error(error.response.data.message)
          }
    }

    useEffect(() => {
        if (sessionStorage.getItem('currentUser') !== null) {
            setCurrentuser(JSON.parse(sessionStorage.getItem('currentUser')))
            console.log(currentUser)
            console.log(userRole);
        }
        const storedToken = sessionStorage.getItem('authToken');
        if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    },[]);

    const establishSession = (user, token) => {
        setUserRole(user.role)
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCurrentuser(user)
        toast.success("Logged In!")
        navigate('/dashboard')
    }

    const handleGoogleAuth = async (idToken,role) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google`, {
              idToken,
              role
            });

            establishSession(response.data.user, response.data.token)
        } catch (error) {
            toast.error(error.response?.data?.message || "Google sign-in failed")
        }
    }

    const handleLogin = async (email,password,role) => {
        //USER FETCHING FUNCTION
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
              email,
              password,
              role
            });

            console.log(response.data); // Successful login message
            establishSession(response.data.user, response.data.token)
        } catch (error) {
            console.log(role);
            //console.error('Login error:', error.response.data);
            toast.error(error.response.data.message)
        }

       /*if(role === 'patient'){
            //setUserRole('patient')
            const user = {id:10, 
                email:email,
                password:password,
                fullname:'John Doe', 
                image: pf1,
                age:'30',
                gender:'Male',
                bloodgroup:'A+',
                address:'123 Baker Street',
                role:'patient', 
                isverified:true}
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentuser(user)
            toast.success("Logged In!")
            navigate('/dashboard')
        }

        if(role === 'doctor'){
            //setUserRole('doctor')
            const user = {id:'1',
            email:email,
            password:password,
            fullname:'Mark Doe',
            image: doc_1,
            age:'55',
            gender:'Male',
            address:'123 Baker Street',
            role:'doctor',
            degree:'MBBS, MD',
            speciality: 'Pediatrician',
            regno:'12345678',
            regyear:'1998',
            experience: '15',
            starttime: '09:00',
            endtime: '17:00',
            isverified:true}

        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentuser(user);
            toast.success("Logged In!")
            navigate('/dashboard')
        }*/
    }

    function handleLogout(){
        //setUserRole('')
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentuser('');
        console.log(currentUser)
        navigate('/Register')
    }

    const handleDeleteAccount = async () => {
        try{
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/auth/delete`, {
               data:{
                    email:  currentUser.email,  
                    role:  currentUser.role
                }
            });
            console.log(response.data.message)
            sessionStorage.removeItem('currentUser');
            toast.success(response.data.message)
            setCurrentuser('');
        } catch(error){
            console.log(error);
            toast.error("Error in deleting account")
        }
    }

    const handleChangePassword = async (currentPassword, newPassword) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
                currentPassword,
                newPassword
            });
            toast.success(response.data.message)
            return true
        } catch (error) {
            toast.error(error.response?.data?.message || "Error changing password")
            return false
        }
    }

    //USER DETAILS UPDATE
    const updateUserDetails = (updatedDetails) => {
        console.log(updatedDetails)
        setCurrentuser((prevDetails) => ({
          ...prevDetails,
          ...updatedDetails
        }));
        console.log(currentUser)
    };

    const handleSaveChanges = async () => {
        //FUNCTION UPDATE USER DETAILS IN DB
        console.log('Updated user details:', currentUser);
        try{
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/updateProfile`, {
                currentUser
            });
            //console.log(response.data.message)
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            setIsEditing(false);
            toast.success("Details Updated!")
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/fetchUser`, {
                    currentUser
                });
          
                const user = await response.data;
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentuser(user)
            } catch (error) {
                console.error('Login error:', error.response.data);
                //toast.error(error)
            }
        } catch(error){
            console.log(error);
            toast.error("Error in updating profile")
        }
    }
    
    const value = {
        currentUser: currentUser,
        userRole: userRole,
        isEditing: isEditing,
        setIsEditing: setIsEditing,
        handleLogin: handleLogin,
        handleGoogleAuth: handleGoogleAuth,
        handleSignup: handleSignup,
        handleSaveChanges: handleSaveChanges,
        handleChangePassword: handleChangePassword,
        updateUserDetails: updateUserDetails,
        handleLogout: handleLogout,
        handleDeleteAccount: handleDeleteAccount
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}