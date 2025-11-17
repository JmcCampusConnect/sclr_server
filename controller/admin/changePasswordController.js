const StaffModel = require('../../models/Staff');

// ----------------------------------------------------------------------------------------------------------------

// Change password for admin

const changePassword = async (req, res) => {

    try {

        const { password } = req.body;

        const staff = await StaffModel.findOne({ staffId: "ADMIN" });

        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        staff.password = password;
        await staff.save();
        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Error changing password: ', error);
        res.status(500).json({ message: 'Error changing password' });
    }

}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { changePassword };
