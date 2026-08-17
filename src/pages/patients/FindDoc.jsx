import { useAuth } from "../../store/AuthProvider"
import { useData } from "../../store/DataProvider"
import { Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Avatar } from "@mui/material"
import BookAppointment from "./BookAppointment"

const FindDoc = () => {
    const { currentUser } = useAuth()
    const { doctors, fetchDoctors } = useData()

    const [search, setSearch] = useState('')
    const [filteredDoctors, setFilteredDoctors] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchDoctors()
            } catch (error) {
                console.error("Error fetching doctors:", error)
            }
        }
        fetchData()
    }, [fetchDoctors])

    useEffect(() => {
        const filtered = doctors.filter((doctor) => {
            if (doctor.isverified === true) {
                if (search === "") {
                    // No search, include all verified doctors
                    return true;
                }
                else if (
                    doctor.fullname.toLowerCase().includes(search.toLowerCase()) ||
                    doctor.speciality.toLowerCase().includes(search.toLowerCase())
                ) {
                    // Doctor matches the search
                    return true;
                }
            }
            return false; // Exclude non-verified doctors or those not matching search
        });
    
        setFilteredDoctors(filtered);
    }, [doctors, search]);

    if (currentUser.role === 'doctor') {
        return <Navigate to='/' />
    }

    if (currentUser.role === 'patient') {
        const isProfileComplete = currentUser.age && currentUser.gender && currentUser.bloodgroup && currentUser.address;
        if (isProfileComplete) {
            return (
                <div className="fadein relative top-16 mb-24 font-poppins min-h-screen">
                    <div className="flex flex-col items-center justify-center pt-20">
                        <div data-aos='fade-down' className="w-full text-center text-4xl font-bold">
                            Professional care with a <span className="text-primary-blue"> personal touch</span>
                        </div>
                        <input
                            className="border-2 p-2 mt-5 w-3/5 border-black rounded-xl"
                            type="text"
                            name="search"
                            placeholder="Search by Name/Speciality"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap mx-28 my-10 justify-center" data-aos='fade-up'>
                        {filteredDoctors.length > 0 ? filteredDoctors.map((doctor) => (
                            <div key={doctor.email} className="flex flex-col items-center justify-center shadow-lg p-5 w-60 m-4 duration-300 hover:scale-102">
                                <Avatar alt="Remy Sharp" src={doctor.image} sx={{ width: 150, height: 150 }} />

                                <div className="font-semibold text-lg my-2 text-center">Dr. {doctor.fullname}</div>
                                <div>{doctor.speciality}</div>
                                <div>{doctor.degree}</div>
                                <div>{doctor.starttime} - {doctor.endtime} hrs</div>

                                    <BookAppointment 
                                        doctor_name={doctor.fullname} 
                                        doctor_id={doctor.email} 
                                        starttime={doctor.starttime} 
                                        endtime={doctor.endtime} 
                                        currentUser={currentUser}
                                    />
                                </div>
                            )) : (
                            <div>No doctors found</div>
                        )}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="text-center fadein relative top-8 min-h-screen font-poppins font-bold flex flex-col lg:flex-row items-center justify-center text-6xl">
                    KINDLY COMPLETE YOUR<span className="text-primary-blue ml-2"> PROFILE</span>
                </div>
            )
        }
    }
}

export default FindDoc
