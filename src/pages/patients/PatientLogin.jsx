import { useState } from "react";
import { useAuth } from "../../store/AuthProvider";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const PatientLogin = () => {    
    const {handleLogin} = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [emailError, setEmailError] = useState("")

    const handlePatientLogin = (e) => {
        e.preventDefault()
        handleLogin(email,password,'patient')
    }

    return (
        <div className="mt-8 mb-4 w-4/5 flex-col">
            <form onSubmit={handlePatientLogin}>
            <div>
                <label className="text-primary-blue font-semibold" htmlFor="email">Email Address</label><br />
                <input 
                className="outline w-full mt-2 mb-7 h-8 p-2 rounded-md" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div>
                <label className="text-primary-blue font-semibold" htmlFor="password">Password</label><br />
                <input 
                className="outline w-full mt-2 h-8 p-2 mb-2 rounded-md" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div className="text-center mt-4">
                <input 
                type="submit" 
                value='Login' 
                className="border-2 text-primary-white bg-blue border-blue-700 bg-blue-700 w-full text-lg rounded-md hover:bg-blue-600 hover:border-blue-600 cursor-pointer"/>
            </div>
            </form>
            <GoogleAuthButton role="patient"/>
        </div>
    )
}

/*<div className="text-4xl mb-4 font-bold">Log In</div>
            <div className="flex">
                <Link className="mr-4 py-1 px-3 border-blue-700 bg-blue-700 text-primary-white rounded-full">Patient</Link>
                <Link className="py-1 px-3 rounded-full bg-gradient-to-r from-blue-700 from-50% to-white/30 to-50% bg-right bg-200% hover:bg-left transition-all duration-300 hover:text-primary-white" to='/Register/doclogin'>
                    Doctor
                </Link>
            </div>*/
export default PatientLogin;