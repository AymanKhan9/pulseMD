import { useAuth } from "../../store/AuthProvider"
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import MyProfile from "./MyProfile";
import { Prescriptions } from "./Prescriptions";
import ScheduledMeetings from "./ScheduledMeetings";
import { Avatar } from "@mui/material";

export const Dashboard = () => {
    const [tab, setTab] = useState("profile")
    const {currentUser} = useAuth()
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const payment = searchParams.get('payment');
        if (payment === 'success') {
            toast.success("Payment successful! Your appointment is awaiting the doctor's confirmation.");
            setTab('meetings');
            setSearchParams({});
        } else if (payment === 'cancelled') {
            toast.error("Payment was cancelled. Your appointment was not confirmed.");
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    return(
        <div className="fadein w-full relative top-24 flex flex-col lg:flex-row font-poppins items-center mb-48 min-h-screen px-5">
            <div className="flex flex-row lg:flex-col items-center justify-center mb-8 mx-5">
                <Avatar className="mb-5 mr-4 lg:mr-0" alt="Remy Sharp" src={currentUser.image} sx={{ width: 150, height: 150 }} />
            
                <div className="text-center text-3xl md:text-6xl font-bold">Hello <span className="text-primary-blue">{currentUser.role === 'doctor' && `Dr.`} {currentUser.fullname}!</span></div>
            </div>

            <div className="px-8 py-5 rounded-lg shadow-xl w-full md:w-4/5 lg:w-3/5 ">
                <div className="flex-col flex lg:flex-row justify-center">
                    <button onClick={() => setTab('profile')} className={`${tab === 'profile' && "active-tab"} tab lg:w-full lg:mb-0 px-3 py-2`}>My Profile</button>
                    <button onClick={() => setTab('meetings')} className={`${tab === 'meetings' && "active-tab"} tab lg:w-full px-3 py-2 mx-3`}>Scheduled Meetings</button>
                    {currentUser.role === 'patient' && <button onClick={() => setTab('prescriptions')} className={`${tab === 'prescriptions' && "active-tab"} tab lg:w-full px-3 py-2`}>My Prescriptions</button>}
                </div>
                
                {tab === 'profile' && <MyProfile/>}
                {tab === 'meetings' && <ScheduledMeetings/>}
                {tab === 'prescriptions' && <Prescriptions/>}
            </div>
        </div>
    )
}