import { useState } from "react";
import { useData } from "../../store/DataProvider";
import { Modal } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";

export default function Prescribe({patient_name,doctor_id,presc,patient,date}){
    const {fetchYourPatients} = useData()
    const [open, setOpen] = useState(false)
    const [prescriptionInput, setPrescriptionInput] = useState(presc.join(', '));
    const [prescriptions, setPrescriptions] = useState(presc)
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
      setOpen(false)
    };

    const handlePrescriptionInputChange = (event) => {
        setPrescriptions(event.target.value.split(',').map(prescription => prescription.trim()));
        setPrescriptionInput(event.target.value);
    };

      const handleAddPrescriptions = async (e) => {
        e.preventDefault()
        console.log(prescriptions)
        console.log(doctor_id)
        try{
            //const newPrescriptions = prescriptionInput.split(',').map(prescription => prescription.trim());
            //const validPrescriptions = newPrescriptions.filter(prescription => prescription !== '');
            //setPrescriptions([...prescriptions, ...validPrescriptions]);
            
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointment/prescriptions`,{
              patient,doctor_id,prescriptions,date
            })

            toast.success("Prescription Sent!")
            setOpen(false)
            fetchYourPatients(doctor_id);
        } catch(error){
            toast.error("Failed to send prescription!")
        }
      };
    
    return (
        <>
          <button className="lg:absolute lg:right-8 my-2 lg:my-0 text-sm h-8 bg-blue-600 px-4 text-primary-white text-center hover:bg-blue-700" onClick={handleOpen}>Edit</button>
          <Modal
            open={open}
            onClose={handleClose}
            className="flex justify-center h-fit mt-52 font-poppins"
            >
            
            <form className="flex flex-col bg-white p-5 w-96" onSubmit={handleAddPrescriptions}>
                <p className="font-semibold text-lg">{patient_name}'s Prescriptions</p>
                <textarea className='mt-4 border-2 p-1' value={prescriptionInput} name="prescriptions" id="" cols="30" rows="5" placeholder='Add Prescriptions' onChange={handlePrescriptionInputChange}></textarea>
  
                <button className='mt-5 p-2 bg-blue-600 text-primary-white hover:bg-blue-700'>Confirm</button>
            </form>
          </Modal>
        </>
      )
}