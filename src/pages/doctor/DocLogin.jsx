import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../store/AuthProvider";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const DocLogin = () => {
    const {handleLogin} = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [emailError, setEmailError] = useState("")

    const handleDoctorLogin = (e) => {
        e.preventDefault()
        handleLogin(email,password,'doctor')
    }
    return (
            <div className="mt-8 mb-4 w-4/5 flex-col">
                <form onSubmit={handleDoctorLogin}>
                    <div>
                        <label className="text-primary-blue font-semibold" htmlFor="email">Email Address</label><br />
                        <input 
                        className="outline w-full mt-2 mb-7 h-8 p-2 rounded-md" 
                        type="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <label className="text-primary-blue font-semibold" htmlFor="password">Password</label><br />
                        <input
                        className="outline w-full mt-2 h-8 p-2 mb-2 rounded-md" 
                        type="password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="text-center mt-4">
                        <input type="submit" value='Login' className="border-2 text-primary-white bg-blue border-blue-700 bg-blue-700 w-full text-lg rounded-md hover:bg-blue-600 hover:border-blue-600 cursor-pointer"/>
                    </div>
                </form>
                <GoogleAuthButton role="doctor"/>
            </div>
    )
}

export default DocLogin;