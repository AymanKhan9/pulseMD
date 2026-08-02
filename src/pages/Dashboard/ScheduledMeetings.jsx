import { useAuth } from "../../store/AuthProvider"
import { useState,useEffect } from "react";
import { useData } from "../../store/DataProvider";
import axios from "axios";
import { toast } from "react-toastify";
import { CircularProgress, Box } from "@mui/material";

export default function ScheduledMeetings(){
    const {userAppointments, fetchUserAppointments} = useData()
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     //FETCH APPOINTMENTS
    //     console.log("fetching...");
    //     fetchUserAppointments(currentUser.email,currentUser.role)
    // }, [])

    useEffect(() => {
        const fetchAppointments = async () => {
            console.log("Fetching appointments...");

            try {
                setLoading(true);
                // Call fetchUserAppointments to get appointments and set them
                await fetchUserAppointments(currentUser.email, currentUser.role);
                console.log("Appointments fetched successfully.");
                setLoading(false);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };

        if (currentUser.email && currentUser.role) {
            fetchAppointments(); // Trigger fetching when `currentUser` is available
        }
    }, [currentUser.email, currentUser.role]);
    
    const ScheduledAppointments = userAppointments.filter((app) => {
        const appDate = new Date(app.date)
        const currentDate = new Date()
        if(appDate > currentDate) return app;
    })
    console.log("user apts",userAppointments);
    console.log("sche apts",ScheduledAppointments)

    const handleAccept = async (patient,date) => {
        console.log(patient,date)
      //FUNCTION SENDS APPOINTMENT ID AND CONFIRMS IT
      try {
        const response = await axios.post('${process.env.REACT_APP_API_URL}/appointment/accept', {
          patient,date
        });
        console.log("accept handled")
        toast.success("Meeting Accepted")
        fetchUserAppointments(currentUser.email,currentUser.role)
      } catch (error) {
        toast.error("Error")
        console.error('Error');
      } 
    }

    const handleReject = async (patient,date) => {
        console.log(patient)
        //FUNCTION SENDS APPOINTMENT ID AND DELETES IT FROM DB
        try {
            const response = await axios.delete('${process.env.REACT_APP_API_URL}/appointment/reject', {
                data:{
                    patient_id:  patient,
                    date: date
                }
            });
            toast.success("Meeting Removed")
            fetchUserAppointments(currentUser.email,currentUser.role)
          } catch (error) {
            toast.error("Error")
            console.error('Error');
          } 
    }

    /*const DocAppoint = [
        {
            _id:'1',
            patient_name:"Raj Dev",
            date:"Wed Feb 28 2024 15:15:00",
            symptoms:"Cough",
            isConfirmed:true
        },
        {   
            _id:'2',
            patient_name:"Jessica Martin",
            date:"Thu Feb 29 2024 15:15:00",
            symptoms:"Sore Throat",
            isConfirmed:true
        },
        {   
            _id:'3',
            patient_name:"Sam Welsh",
            date:"Thu Feb 29 2024 10:00:00",
            symptoms:"High Fever",
            isConfirmed:false
        }
    ]*/

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                     <CircularProgress size={60} color="primary" />
            </Box>
        )
    } else {
    if(currentUser.role === 'patient'){
        if(ScheduledAppointments.length === 0){
            return (
                <div className="flip min-h-96 mt-8 font-poppins flex items-center justify-center" data-aos="fade-up">
                    <div className="text-6xl font-medium text-center">No Meetings Scheduled</div>
                </div>
            )
        } else{
            return(
            <div className="min-h-96 mt-6 font-poppins flex flex-col" data-aos="fade-up">
                {ScheduledAppointments.map((app) => {
                    return (
                        <div key={app._id} className="bg-blue-100 mb-4 rounded-md p-3 flex flex-col sm-xl:flex-row items-center justify-between hover:scale-101 hover:duration-200">
                            <div className="text-center sm-xl:text-left">
                                <div className="font-semibold text-lg text-primary-blue">Dr. {app.doctor_name}</div>
                                <div className=""><span className="font-semibold">Date:</span> {app.date}</div>
                                <div><span className="font-semibold">Your Symptoms:</span> {app.symptoms}</div>
                            </div>
                            
                            {app.isConfirmed && <a href="https://meet.google.com/" target="blank" className="bg-blue-600 text-primary-white mt-5 sm-xl:mt-0 py-2 px-5 shadow-xl rounded-sm hover:bg-blue-700">JOIN</a>}
                            {!app.isConfirmed && <p className="italic text-error mt-2 sm-xl:mt-0">Status Pending</p>}
                        </div>
                    )
                })}
            </div>
        )}
    }

    if(currentUser.role === 'doctor'){
        console.log("in doctor if");
        if(ScheduledAppointments.length === 0){
            return (
                <div className="flip min-h-96 mt-8 font-poppins flex items-center justify-center" data-aos="fade-up">
                    <div className="text-6xl font-medium text-center">No Meetings Scheduled</div>
                </div>
            )
        } else{
            return(
            <div className="min-h-96 mt-6 font-poppins flex flex-col" data-aos="fade-up">
                {ScheduledAppointments.map((app) => {
                    return (
                        <div key={app._id} className="bg-blue-100 mb-4 rounded-md p-3 flex flex-col sm-xl:flex-row items-center justify-between hover:scale-101 hover:duration-200">
                            <div className="text-center sm-xl:text-left"> 
                                <div className="font-semibold text-lg text-primary-blue">{app.patient_name}</div>
                                <div className=""><span className="font-semibold">Date:</span> {app.date}</div>  
                                <div><span className="font-semibold">Symptoms: </span>{app.symptoms}</div>
                            </div>  
                                                
                            {app.isConfirmed && <a href="https://meet.google.com/" target="blank" className=" bg-blue-600 text-primary-white mt-5 sm-xl:mt-0 py-2 px-4 shadow-xl rounded-sm hover:bg-blue-700">JOIN</a>}
                            {!app.isConfirmed && 
                                <div className="lg:flex lg:flex-col lg-xl:block mt-5 sm-xl:mt-0">
                                    <button className="bg-red-600 text-primary-white lg:ml-2 lg:mb-2 lg-xl:mb-0 py-2 px-4 shadow-xl rounded-sm mr-2 cursor-pointer hover:bg-red-700" onClick={() => handleReject(app.patient_id,app.date)}>Reject</button>
                                    <button className="bg-green-600 text-primary-white py-2 px-4 shadow-xl rounded-sm cursor-pointer hover:bg-green-500" onClick={() => handleAccept(app.patient_id,app.date)}>Accept</button>
                                </div>}
                        </div>
                    )
                })}
            </div>   
        )}
    }
}

    
}