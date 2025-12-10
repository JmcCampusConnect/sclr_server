const ApplicationModel = require('../../models/Application');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Upload Mark Data

const uploadMarkExcel = async (req, res) => {

    try {

        const { excelData } = req.body;

        if (!excelData || excelData.length === 0) {
            return res.status(400).json({ message: "Excel data is empty" });
        }

        const updates = excelData.map(async (row) => {
            if (!row._id) return;
            await ApplicationModel.findByIdAndUpdate(
                row._id,
                {
                    semesterMarkPercentage: row.semesterMarkPercentage === "" ? -1 : Number(row.semesterMarkPercentage),
                    semesterArrear: row.semesterArrear === "" ? 0 : Number(row.semesterArrear),
                    semesterGrade: row.semesterGrade || "A"
                },
                { new: true }
            );
        });

        await Promise.all(updates);

        res.status(200).json({ message: "Excel data updated successfully" });
    } catch (error) {
        console.error("Excel upload error in coe mark entry data : ", error);
        res.status(500).json({ message: "Server error while updating" });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { uploadMarkExcel };
