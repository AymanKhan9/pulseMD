import { useAuth } from "../../store/AuthProvider";
import { useState } from "react";
import { Alert } from "@mui/material";
import DeleteAccountDialog from "./DeleteAccountDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function MyProfile(){
    const {currentUser,updateUserDetails,handleSaveChanges, isEditing, setIsEditing} = useAuth()
    const [selectedFile, setSelectedFile] = useState(null);
    const [open, setOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const handleDialogOpen = () => {
      setOpen(true);
    };

    const handleDialogClose = () => {
    setOpen(false);
    };

    const handleFieldClick = (field) => {
        setIsEditing(field);
    };

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateUserDetails({ image: reader.result });
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleInputChange = (e) => {
      updateUserDetails({[e.target.name]: e.target.value});
    };
  
    if(currentUser.role === 'patient'){
      const isProfileIncomplete = !currentUser.age || !currentUser.gender || !currentUser.bloodgroup || !currentUser.address;
      return (
          <div className="mt-8 flex flex-col min-h-96 justify-center" data-aos='fade-up'>
            {isProfileIncomplete && <Alert className="mb-6" severity="warning">Kindly Complete Your Profile.</Alert>}
              
              <div className="flex flex-col mb-4">
                <label className="font-bold text-md">Name*</label>
                <input
                    className="py-2 border-b-2 outline-none focus:border-blue-700"
                    type="text"
                    required
                    placeholder="Full Name"
                    name="fullname"
                    value={currentUser.fullname}
                    onClick={() => handleFieldClick('fullname')}
                    onChange={handleInputChange}
                    readOnly//={!isEditing || isEditing !== 'fullname'}
                />
              </div>

              <div className="flex flex-col justify-between items-baseline mb-4">
                <label className="font-bold text-md">Email*</label>
                  <input
                    className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                    placeholder="Email"
                    type="email"
                    required
                    name="email"
                    value={currentUser.email}
                    readOnly
                  />
              </div>

              {currentUser.hasPassword && (
                <div className="flex flex-col mb-4">
                  <button type="button" className="text-primary-blue font-semibold text-left underline" onClick={() => setPasswordDialogOpen(true)}>Change Password</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="w-full flex flex-col items-baseline mb-5">
                  <label className="font-bold text-md mr-4">Age</label>
                  <input
                  className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                      type="number"
                      name="age"
                      placeholder="Enter Age"
                      maxLength={2}
                      value={currentUser.age}
                      onClick={() => handleFieldClick('age')}
                      onChange={handleInputChange}
                      readOnly={!isEditing || isEditing !== 'age'}
                  />                
                </div>

                <div className="flex flex-col items-baseline mb-5 w-full">
                  <label className="font-bold text-md">Gender</label>  
                  <select
                    className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                    name="gender"
                    value={currentUser.gender}
                    onClick={() => handleFieldClick('gender')}
                    onChange={handleInputChange}
                    readOnly={!isEditing || isEditing !== 'gender'}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-between items-baseline mb-4">
                  <label className="font-bold text-md"> Blood Group </label>               
                  <input
                    name="bloodgroup"
                    className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                    type="text"
                    maxLength={3}
                    value={currentUser.bloodgroup}
                    onClick={() => handleFieldClick('bloodgroup')}
                    onChange={handleInputChange}
                    readOnly={!isEditing || isEditing !== 'bloodgroup'}
                  />                
              </div>

              <div className="flex flex-col justify-between items-baseline mb-4">
                  <label className="font-bold text-md">Address</label>
                  <input
                    name="address"
                    className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                    type="text"
                    value={currentUser.address}
                    onClick={() => handleFieldClick('address')}
                    onChange={handleInputChange}
                    readOnly={!isEditing || isEditing !== 'address'}
                  />
              </div>
              <div className="flex flex-col justify-between items-baseline mb-4">
                  <label className="font-bold text-md">Profile Picture</label>
                  <input
                    name="image"
                    className="py-2"
                    type="file"
                    onChange={handleImageChange}
                  />
              </div>

          <button className="mb-4 w-full text-primary-white p-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveChanges}>Save Changes</button>
          <button className="w-full text-primary-white p-2 bg-red-600 hover:bg-red-700" onClick={handleDialogOpen}>Delete Account</button>

          <DeleteAccountDialog isOpen={open} handleClose={handleDialogClose}/>
          <ChangePasswordDialog isOpen={passwordDialogOpen} handleClose={() => setPasswordDialogOpen(false)}/>
      </div>
      )
  }



  if(currentUser.role === 'doctor'){
    return(
      <div className="mt-8 flex flex-col" data-aos='fade-up'>
        {!currentUser.isverified && <Alert className="mb-6" severity="warning">Your profile is yet to be verified by our admins.</Alert>}
        <div className="flex flex-col mb-4">
          <label className="font-bold text-md">Name*</label>
          <input
              className="py-2 border-b-2 outline-none focus:border-blue-700"
              type="text"
              required
              placeholder="Full Name"
              name="fullname"
              value={currentUser.fullname}
              onClick={() => handleFieldClick('fullname')}
              onChange={handleInputChange}
              readOnly//={!isEditing || isEditing !== 'fullname'}
          />
        </div>

        <div className="flex flex-col justify-between items-baseline mb-4">
          <label className="font-bold text-md">Email*</label>
            <input
              className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
              placeholder="Email"
              type="email"
              required
              name="email"
              value={currentUser.email}
              readOnly
            />
        </div>

        {currentUser.hasPassword && (
          <div className="flex flex-col mb-4">
            <button type="button" className="text-primary-blue font-semibold text-left underline" onClick={() => setPasswordDialogOpen(true)}>Change Password</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <div className="w-full flex flex-col items-baseline mb-5">
            <label className="font-bold text-md mr-4">Age</label>
            <input
            className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                type="number"
                name="age"
                required
                placeholder="Enter Age"
                maxLength={2}
                value={currentUser.age}
                onClick={() => handleFieldClick('age')}
                onChange={handleInputChange}
                readOnly={!isEditing || isEditing !== 'age'}
            />                
          </div>

          <div className="flex flex-col items-baseline mb-5 w-full">
            <label className="font-bold text-md">Gender</label>  
            <select
              className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
              name="gender"
              required
              value={currentUser.gender}
              onClick={() => handleFieldClick('gender')}
              onChange={handleInputChange}
              readOnly={!isEditing || isEditing !== 'gender'}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="w-full flex flex-col items-baseline mb-5">
              <label className="font-bold text-md mr-4">Registration No.</label>                 
              <input
              className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                  type="number"
                  name="regno"
                  required
                  placeholder="Enter Registration No."
                  maxLength={8}
                  value={currentUser.regno}
                  onClick={() => handleFieldClick('regno')}
                  onChange={handleInputChange}
                  readOnly={!isEditing || isEditing !== 'regno'}
              />                
          </div>
          <div className="w-full flex flex-col items-baseline mb-5">
              <label className="font-bold text-md">Registration Year</label>                 
              <input
              className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                  type="number"
                  name="regyear"
                  required
                  placeholder="Enter Registration Year"
                  min={1900}
                  max={2099}
                  maxLength={4}
                  value={currentUser.regyear}
                  onClick={() => handleFieldClick('regyear')}
                  onChange={handleInputChange}
                  readOnly={!isEditing || isEditing !== 'regyear'}
              />                
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <label className="font-bold text-md">Degree*</label>
          <input
              className="py-2 border-b-2 outline-none focus:border-blue-700"
              type="text"
              required
              placeholder="Degree"
              name="degree"
              value={currentUser.degree}
              onClick={() => handleFieldClick('degree')}
              onChange={handleInputChange}
              readOnly={!isEditing || isEditing !== 'degree'}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="w-full flex flex-col items-baseline mb-5">
            <label className="font-bold text-md">Experience (years)</label>                 
            <input
            className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                type="number"
                name="experience"
                required
                placeholder="Enter Experience (in years)"
                min={2}
                value={currentUser.experience}
                onClick={() => handleFieldClick('experience')}
                onChange={handleInputChange}
                readOnly={!isEditing || isEditing !== 'experience'}
            />        
          </div>

          <div className="flex flex-col items-baseline mb-5 w-full">
            <label className="font-bold text-md">Speciality</label>  
            <select
              className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
              name="speciality"
              value={currentUser.speciality}
              onClick={() => handleFieldClick('speciality')}
              onChange={handleInputChange}
              readOnly={!isEditing || isEditing !== 'speciality'}
            >
              <option value="" disabled>Select Speciality</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Radiology">Radiology</option>
              <option value="Surgery">Surgery</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Orthopedics">Orthodontist</option>
              <option value="Gynecology">Gynecology</option>
            </select>                   
          </div>
        </div>

        <div className="flex flex-col justify-between items-baseline mb-4">
          <label className="font-bold text-md">Address</label>
          <input
            name="address"
            className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
            type="text"
            value={currentUser.address}
            onClick={() => handleFieldClick('address')}
            onChange={handleInputChange}
            readOnly={!isEditing || isEditing !== 'address'}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="w-full flex flex-col items-baseline mb-5">
            <label className="font-bold text-md">Starting Time*</label>                 
            <input
            className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                type="time"
                name="starttime"
                value={currentUser.starttime}
                required
                onClick={() => handleFieldClick('starttime')}
                onChange={handleInputChange}
                readOnly={!isEditing || isEditing !== 'starttime'}
            />                
          </div>

          <div className="w-full flex flex-col items-baseline mb-5">
            <label className="font-bold text-md">Ending Time*</label>                 
            <input
            className="w-full py-2 border-b-2 outline-none focus:border-blue-700"
                type="time"
                name="endtime"
                value={currentUser.endtime}
                required
                onClick={() => handleFieldClick('endtime')}
                onChange={handleInputChange}
                readOnly={!isEditing || isEditing !== 'endtime'}
            />                
          </div>
        </div>
        <div className="flex flex-col justify-between items-baseline mb-4">
            <label className="font-bold text-md">Profile Picture</label>
            <input
              name="image"
              className="py-2"
              type="file"
              onChange={handleImageChange}
            />
        </div>

        <button className="mb-4 w-full text-primary-white p-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveChanges}>Save Changes</button>
        <button className="w-full text-primary-white p-2 bg-red-600 hover:bg-red-700" onClick={handleDialogOpen}>Delete Account</button>

        <DeleteAccountDialog isOpen={open} handleClose={handleDialogClose}/>
        <ChangePasswordDialog isOpen={passwordDialogOpen} handleClose={() => setPasswordDialogOpen(false)}/>
      </div>
    )
  }
  
}