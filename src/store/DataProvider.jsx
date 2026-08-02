import { useContext,createContext, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import doc_1 from '../images/doc-prof-1.jpg'
import doc_2 from '../images/doc-prof-2.jpg'
import doc_3 from '../images/doc-prof-3.jpg'
import pf1 from '../images/test-1.jpg'
import pf2 from '../images/test-2.jpg'
import axios from "axios";
import { toast } from 'react-toastify';


export const DataContext = createContext()

export function useData() {
    return useContext(DataContext);
}

export default function DataProvider({children}){
    const {currentUser} = useAuth()

    const [yourPatients, setYourPatients] = useState([/*
        {
            app_id: '1',
            fullname:'John Doe', 
            image: pf1,
            age:'30',
            gender:'Male',
            bloodgroup:'A+',
            symptoms: 'Fever',
            prescriptions:['Cetrizine - 3 days','Paracetamol - 5 days'],
            date:"Sun Feb 25 2024 15:15:00",
            isConfirmed: true //GRAB DATA ONLY FOR THOSE RECORDS THAT ARE TRUE
        },
        {
            app_id: '2',
            fullname:'Jack Morgan', 
            image: pf2,
            age:'44',
            gender:'Male',
            bloodgroup:'O+',
            symptoms: 'Sore Throat',
            prescriptions:['Cetrizine - 3 days'],
            date:"Sun Feb 25 2024 15:15:00",
            isConfirmed: true //GRAB DATA ONLY FOR THOSE RECORDS THAT ARE TRUE
        },
        {
            app_id: '3',
            fullname:'William Dankworth', 
            age:'39',
            gender:'Male',
            bloodgroup:'O+',
            symptoms: 'Cough',
            prescriptions:['Cetrizine - 3 days','Cough Syrup - 5 days'],
            date:"Sun Feb 25 2024 15:15:00",
            isConfirmed: true //GRAB DATA ONLY FOR THOSE RECORDS THAT ARE TRUE
        },
        {   
            app_id: '4',
            fullname:'Ashley Gordan', 
            age:'33',
            gender:'Female',
            bloodgroup:'AB+',
            symptoms: 'Cough',
            prescriptions:['Cough Syrup - 7 days'],
            date:"Sun Mar 25 2024 14:00:00",
            isConfirmed: true //GRAB DATA ONLY FOR THOSE RECORDS THAT ARE TRUE
        }
    */])

    const [doctors, setDoctors] = useState([/*
        {
            id:'1',
            fullname:'Mark Doe',
            image: doc_1,
            degree:'MBBS, MD',
            speciality: 'Pediatrician',
            starttime: '09:30',
            endtime: '17:00',
            isverified:true
        },
        {
            id:'2',
            fullname:'Jack Allen',
            degree:'MBBS, MD',
            image: doc_2,
            speciality: 'Orthopedics',
            starttime: '09:00',
            endtime: '15:00',
            isverified:true
        },
        {
            id:'3',
            fullname:'Brown Allen',
            degree:'MBBS, MD',
            speciality: 'Orthopedics',
            starttime: '09:00',
            endtime: '15:00',
            isverified:true
        },
        {
            id:'4',
            fullname:'William Brown',
            degree:'MBBS, MD',
            speciality: 'Radiology',
            starttime: '10:00',
            endtime: '15:00',
            isverified:true
        },
        {
            id:'5',
            fullname:'Max Wood',
            degree:'MBBS, MD',
            speciality: 'Dermatalogy',
            starttime: '11:00',
            endtime: '17:00',
            isverified:true
        },
        {
            id:'6',
            fullname:'Jennifer Allen',
            degree:'MBBS, MD',
            image: doc_3,
            speciality: 'Gynacologist',
            starttime: '09:00',
            endtime: '17:00',
            isverified:true
        }*/
    ])

    const [userAppointments, setUserAppointments] = useState([/*
        {
            doctor_name:"Raj Dev",
            date:"Fri Mar 1 2024 23:20:00",
            symptoms:"High Fever",
            prescriptions:['Cough Syrup - 7 days'],
            isConfirmed:true
        },
        {
            doctor_name:"Jessica Martin",
            date:"Sun Feb 25 2024 15:15:00",
            symptoms:"High Fever",
            prescriptions:['Cough Syrup - 7 days'],
            isConfirmed:true
        },
        {
            doctor_name:"Jessica Martin",
            date:"Sat Feb 24 2024 12:20:00",
            symptoms:"High Fever",
            prescriptions:['Paracetamol - 4 days','Cough Syrup - 3 days'],
            isConfirmed:true
        },
        {
            doctor_name:"Sam Welsh",
            date:"Thu Feb 29 2024 10:00:00",
            symptoms:"High Fever",
            prescriptions:['Cough Syrup - 7 days'],
            isConfirmed:false
        },
    */])

    const fetchDoctors = useCallback(async () => {
        try {
            const response = await axios.post('${process.env.REACT_APP_API_URL}/getVerifiedDocuments', {data:"doctor"});
            setDoctors(response.data.data);
          } catch (error) {
            toast.error("Couldn't Fetch Doctors")
            //console.error('Error fetching verified doctors:', error.message);
          }
    },[]) 

    const fetchUserAppointments = async (user_id,role) => {
        console.log('called')
        try {
            const response = await axios.post('${process.env.REACT_APP_API_URL}/appointment/get', {
                user_id,role
            });
            //const result = await response.data.data
            console.log(response.data.data)
            setUserAppointments(response.data.data);
          } catch (error) {
            //toast.error("No Scheduled Appointments")
            console.error('Error fetching appointments:', error.message);
          }
    }

    const fetchYourPatients = async (user_id) => {
        try {
            const response = await axios.post('${process.env.REACT_APP_API_URL}/yourpatients', {
                user_id
            });
            
            setYourPatients(response.data);
          } catch (error) {
            //toast.error("Couldn't Fetch Appointments")
            console.error('Error fetching patients:', error.message);
          }
    }

    const value = {
        doctors: doctors,
        userAppointments: userAppointments,
        yourPatients: yourPatients,
        fetchUserAppointments: fetchUserAppointments,
        fetchYourPatients: fetchYourPatients,
        fetchDoctors: fetchDoctors,
    }

    return(
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )

    
}