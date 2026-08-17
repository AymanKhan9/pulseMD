import { useEffect, useRef } from "react";
import { useAuth } from "../store/AuthProvider";

const GoogleAuthButton = ({ role }) => {
    const { handleGoogleAuth } = useAuth()
    const buttonRef = useRef(null)

    useEffect(() => {
        const renderButton = () => {
            if (!window.google || !buttonRef.current) return false

            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: (response) => handleGoogleAuth(response.credential, role),
            })
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                width: "300",
            })
            return true
        }

        if (renderButton()) return

        // The GIS script loads async — poll briefly until window.google is ready.
        const interval = setInterval(() => {
            if (renderButton()) clearInterval(interval)
        }, 100)

        return () => clearInterval(interval)
    }, [role, handleGoogleAuth])

    return (
        <div className="flex justify-center my-4">
            <div ref={buttonRef}></div>
        </div>
    )
}

export default GoogleAuthButton;
