import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { useAuth } from '../../store/AuthProvider';

export default function ChangePasswordDialog({isOpen,handleClose}){
    const {handleChangePassword} = useAuth()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    const resetAndClose = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setError("")
        handleClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError("New passwords don't match!")
            return
        }
        setError("")
        const success = await handleChangePassword(currentPassword, newPassword)
        if (success) {
            resetAndClose()
        }
    }

    return (
        <Dialog
        open={isOpen}
        onClose={resetAndClose}
        aria-labelledby="change-password-title"
      >
        <DialogTitle id="change-password-title">Change Password</DialogTitle>
        <form onSubmit={handleSubmit}>
            <DialogContent>
                <div className="flex flex-col mb-4 w-72">
                    <label className="font-bold text-md">Current Password</label>
                    <input
                        className="py-2 border-b-2 outline-none focus:border-blue-700"
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="flex flex-col mb-4 w-72">
                    <label className="font-bold text-md">New Password</label>
                    <input
                        className="py-2 border-b-2 outline-none focus:border-blue-700"
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="flex flex-col mb-2 w-72">
                    <label className="font-bold text-md">Confirm New Password</label>
                    <input
                        className="py-2 border-b-2 outline-none focus:border-blue-700"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                {error && <p className="text-error text-sm">{error}</p>}
            </DialogContent>
            <DialogActions>
                <button type="submit" className='border-2 rounded-md border-blue-700 bg-blue-700 text-primary-white px-5 py-1 mr-2 hover:bg-blue-600 hover:border-blue-600'>Save</button>
                <button type="button" onClick={resetAndClose} className='border-2 border-red-700 rounded-md px-5 py-1 mr-2 hover:bg-red-700 hover:text-primary-white'>Cancel</button>
            </DialogActions>
        </form>
      </Dialog>
    )
}
