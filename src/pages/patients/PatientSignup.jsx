import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../store/AuthProvider";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const PatientSignup = () => {
    const {handleSignup} = useAuth()
    const [email, setEmail] = useState("")
    const [fullname, setFullname] = useState("")
    const [password, setPassword] = useState("")
    const [cpassword, setCpassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [emailError, setEmailError] = useState("")

    const handlePatientSignup = (e) => {
        e.preventDefault() //e for EVENT. This line prevents page reload.
        if(password !== cpassword){
            setPasswordError("Passwords don't match!")
        } else if(/[a-zA-Z]/.test(password) == 0){
            setPasswordError("Password should contain characters");
        } else if(/[0-9]/.test(password) == 0){
            setPasswordError("Password should contain numbers");
        }else{
            handleSignup(fullname,email,password,'patient')
        }
    }

    return (
            <div className="mt-8 mb-4 w-4/5 flex-col">
                <form onSubmit={handlePatientSignup}>
                    <div>
                        <input 
                        className="outline w-full mt-2 mb-7 h-8 p-2 rounded-md" 
                        type="email"
                        value={email}
                        placeholder="Enter Your Email"
                        required
                        onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <input 
                        className="outline w-full mt-2 mb-7 h-8 p-2 rounded-md" 
                        type="text"
                        placeholder="Full Name"
                        value={fullname}
                        required
                        onChange={(e) => setFullname(e.target.value)}/>
                    </div>
                    <div>
                        <input 
                        className="outline mt-2 w-full mb-7 h-8 p-2 rounded-md" 
                        type="password"
                        placeholder="Password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div>
                
                        <input 
                        className="outline w-full mt-2 h-8 p-2 mb-2 rounded-md" 
                        type="password"
                        placeholder="Confirm Password"
                        required
                        value={cpassword}
                        onChange={(e) => setCpassword(e.target.value)}/>
                        {passwordError && <p className="text-error text-sm">{passwordError}</p>}
                    </div>
                    <div className="text-center mt-4">
                        <input type="submit" value='Sign up' className="border-2 text-primary-white bg-blue border-blue-700 bg-blue-700 w-full text-lg rounded-md hover:bg-blue-600 hover:border-blue-600 cursor-pointer"/>
                    </div>
                </form>
                <GoogleAuthButton role="patient"/>
            </div>
    )
}

export default PatientSignup;