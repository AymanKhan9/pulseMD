import { useEffect } from "react";
import { Outlet,Link,useSearchParams} from "react-router-dom";
import { toast } from 'react-toastify';
import Slideshow from "./Slideshow";

const Register = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'success') {
            toast.success("Email verified! You can now log in.");
            setSearchParams({});
        } else if (verified === 'failed') {
            toast.error("Verification link is invalid or expired. Please sign up again or request a new link.");
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    return (
        <div className="flex flex-col-reverse md:flex-row md:h-screen fadein">
            <Slideshow/>
            <div className="py-10 md:w-6/12 lg:w-5/12 flex flex-col items-center justify-center bg-blue-50 font-poppins md:p-0">
                <div className="text-6xl mb-10 font-logo" data-aos="fade-down"><Link to='/'>Pulse<span className="text-primary-blue">MD</span></Link></div>
                <Outlet/>
            </div>
        </div>
    )
}

export default Register;