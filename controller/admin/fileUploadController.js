const ApplicationModel = require('../../models/Application');

// ---------------------------------------------------------------------------------------------------------------------------------------------

// Upload Mark Data

const uploadMarkExcel = async (req, res) => {

    try {

        const { excelData } = req.body;

        if (!Array.isArray(excelData) || excelData.length === 0) {
            return res.status(400).json({ message: "Excel data is empty" });
        }

        const updates = excelData
            .filter(row => row._id)
            .map(row => {
                const percentage =
                    row.semesterMarkPercentage === "" ||
                        row.semesterMarkPercentage === null ||
                        row.semesterMarkPercentage === undefined
                        ? -1
                        : Number(row.semesterMarkPercentage);

                const arrear =
                    row.semesterArrear === "" ||
                        row.semesterArrear === null ||
                        row.semesterArrear === undefined
                        ? 0
                        : Number(row.semesterArrear);

                return ApplicationModel.findByIdAndUpdate(
                    row._id,
                    {
                        semesterMarkPercentage: isNaN(percentage) ? -1 : percentage,
                        semesterArrear: isNaN(arrear) ? 0 : arrear,
                        semesterGrade: row.semesterGrade || "A"
                    },
                    { new: true }
                );
            });

        if (!updates.length) {
            return res.status(400).json({ message: "No valid rows to update" });
        }

        await Promise.all(updates);

        res.status(200).json({
            message: "Excel data updated successfully",
            updatedCount: updates.length
        });

    } catch (error) {
        console.error("Excel upload error in COE mark entry : ", error);
        res.status(500).json({ message: "Server error while updating" });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { uploadMarkExcel };
