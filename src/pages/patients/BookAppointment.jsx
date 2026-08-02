import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Alert } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const BookAppointment = ({doctor_id,doctor_name,starttime,endtime,currentUser}) => {
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('');
    const [appointment, setAppointment] = useState({
      date: null,
      symptoms: '',
      doctor_id:doctor_id,
      doctor_name: doctor_name,
      patient_id: currentUser.email,
      prescriptions: [],
      patient_name: currentUser.fullname,
      isConfirmed: false
    });

    useEffect (() => {
      setAppointment(prevState => ({
        ...prevState,
        doctor_id: doctor_id,
        doctor_name: doctor_name
      }));
    }, [doctor_id, doctor_name]);
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
      setOpen(false)
      setErrorMessage('');
    };

    const handleDateChange = (date) => {
    setAppointment(prevState => ({ ...prevState, date }));
    };

    const handleSymptomsChange = (event) => {
      setAppointment(prevState => ({ ...prevState, symptoms: event.target.value }));
    };

    const isTimeWithinSchedule = (date) => {
      if (!date) return false;
     
      const appointmentTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      return appointmentTime >= starttime && appointmentTime <= endtime;
    };

    const handleBookAppointment = async (e) => {
      e.preventDefault()

      if (isTimeWithinSchedule(appointment.date) && appointment.symptoms){
        //FUNCTON TO PUSH APPOINTMENT TO DATABASE
        console.log(appointment)
          try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointment/book`, {
              appointment
            });
            console.log(appointment)
  
            toast.success(response.data.message)
            setErrorMessage('')
            setAppointment(prevState => ({ ...prevState, symptoms: '',date:null }));
            setOpen(false)
          } catch (error) {
            const errVar = "error";
            toast.error(errVar);
            //console.error('Error booking appointment:');
          } 
      } else if(!isTimeWithinSchedule(appointment.date)){
        setErrorMessage("Please choose the time within the doctor's slot");
      } else if(!appointment.symptoms){
        setErrorMessage("Please enter your symptoms");
      }
    };

    return (
      <>
        <button className=" bg-blue-600 text-primary-white text-center w-full p-2 mt-4 hover:bg-blue-700" onClick={handleOpen}>Book Appointment</button>
        <Modal
          open={open}
          onClose={handleClose}
          className="flex justify-center h-fit mt-52 font-poppins"
          >
          <form className="flex flex-col bg-white p-5 w-96"  onSubmit={handleBookAppointment}>
              <LocalizationProvider dateAdapter={AdapterDateFns} >
                <DateTimePicker
                  label="Select Date and Time"
                  value={appointment.date}
                  onChange={handleDateChange}
                  minDate={new Date()} // Optionally set a minimum date
                />
              </LocalizationProvider>
              <textarea className='mt-4 border-2 p-1' value={appointment.symptoms} name="symptoms" id="" cols="30" rows="5" placeholder='Enter Symptoms' onChange={handleSymptomsChange}></textarea>

              <button className='mt-5 p-2 bg-blue-600 text-primary-white hover:bg-blue-700'>Confirm</button>
              {errorMessage && <Alert className='mt-4' severity="error">{errorMessage}</Alert>}
          </form>
        </Modal>
      </>
    )
}

export default BookAppointment