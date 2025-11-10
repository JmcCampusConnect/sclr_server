const StudentModel = require('../../models/Student');
const ApplicationModel = require('../../models/Application');
const AcademicModel = require('../../models/Academic');
const DonorModel = require('../../models/Donor');
const DistributionModel = require('../../models/Distribution');
const { currentAcademicYear } = require('../../utils/commonFunctions');

// ----------------------------------------------------------------------------------------------------------------

// To fetch dashboard cards data

const fetchCardData = async (req, res) => {

	try {

		const academicYear = await currentAcademicYear();
		const countQueries = [
			{ key: 'totalRenewals', model: ApplicationModel, query: { academicYear, sclrType: 'Renewal' } },
			{ key: 'totalFreshers', model: ApplicationModel, query: { academicYear, sclrType: 'Fresher' } },
			{ key: 'totalDonors', model: DonorModel, query: { academicYear } },
		];

		const results = await Promise.all(countQueries.map(item => item.model.countDocuments(item.query)));
		const counts = {};
		countQueries.forEach((item, index) => { counts[item.key] = results[index] });
		const uniqueStudents = await DistributionModel.distinct('registerNo', { academicYear });
		counts.totalBenefitedStudents = uniqueStudents.length;
		const totalScholarshipResult = await DistributionModel.aggregate([
			{ $match: { academicYear } },
			{ $group: { _id: null, totalAmount: { $sum: '$givenAmt' } } }
		]);

		counts.totalScholarshipAwarded = totalScholarshipResult[0]?.totalAmount || 0;
		res.json(counts);

	} catch (error) {
		console.error("Error fetching dashboard cards data : ", error);
		res.status(500).json({ message: 'Error fetching dashboard cards data' });
	}
}

// ----------------------------------------------------------------------------------------------------------------

// To fetch dashboard pie data

const fetchPieData = async (req, res) => {

	try {

		const academicYear = await currentAcademicYear();
		const aidedCount = await ApplicationModel.countDocuments({ academicYear, category: 'Aided' });
		const sfmCount = await ApplicationModel.countDocuments({ academicYear, category: 'SFM' });
		const sfwCount = await ApplicationModel.countDocuments({ academicYear, category: 'SFW' });
		res.json({ aidedCount, sfmCount, sfwCount });

	} catch (error) {
		console.error("Error fetching dashboard cards data : ", error);
		res.status(500).json({ message: 'Error fetching dashboard cards data' });
	}
}

// ----------------------------------------------------------------------------------------------------------------

// To fetch dashboard bar data

const fetchBarData = async (req, res) => {

	try {

		const academicYear = await currentAcademicYear();

		const enrollment = {
			ug: {
				men: [
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["I", "II"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["III", "IV"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["V", "VI"] },
					}),
				],
				women: [
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["I", "II"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["III", "IV"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["V", "VI"] },
					}),
				],
			},
			pg: {
				men: [
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["I", "II"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["III", "IV"] },
					}),
				],
				women: [
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: "SFW",
						semester: { $in: ["I", "II"] },
					}),
					await ApplicationModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: "SFW",
						semester: { $in: ["III", "IV"] },
					}),
				],
			},
		};

		const distributed = {
			ug: {
				men: [
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["I", "II"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["III", "IV"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["V", "VI"] },
					}),
				],
				women: [
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["I", "II"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["III", "IV"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "UG",
						category: "SFW",
						semester: { $in: ["V", "VI"] },
					}),
				],
			},
			pg: {
				men: [
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["I", "II"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: { $in: ["Aided", "SFM"] },
						semester: { $in: ["III", "IV"] },
					}),
				],
				women: [
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: "SFW",
						semester: { $in: ["I", "II"] },
					}),
					await DistributionModel.countDocuments({
						academicYear,
						graduate: "PG",
						category: "SFW",
						semester: { $in: ["III", "IV"] },
					}),
				],
			},
		};
		res.json({ enrollment, distributed });

	} catch (error) {
		console.error("Error fetching dashboard bar data : ", error);
		res.status(500).json({ message: "Error fetching dashboard bar data" });
	}
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchCardData, fetchPieData, fetchBarData };