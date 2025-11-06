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

		// --- UG MEN ---
		const ugFirstYearMen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: { $in: ['Aided', 'SFM'] },
			semester: { $in: ['I', 'II'] },
		});

		const ugSecondYearMen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: { $in: ['Aided', 'SFM'] },
			semester: { $in: ['III', 'IV'] },
		});

		const ugThirdYearMen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: { $in: ['Aided', 'SFM'] },
			semester: { $in: ['V', 'VI'] },
		});

		// --- UG WOMEN ---
		const ugFirstYearWomen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: 'SFW',
			semester: { $in: ['I', 'II'] },
		});

		const ugSecondYearWomen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: 'SFW',
			semester: { $in: ['III', 'IV'] },
		});

		const ugThirdYearWomen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'UG',
			category: 'SFW',
			semester: { $in: ['V', 'VI'] },
		});

		// --- PG MEN ---
		const pgFirstYearMen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'PG',
			category: { $in: ['Aided', 'SFM'] },
			semester: { $in: ['I', 'II'] },
		});

		const pgSecondYearMen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'PG',
			category: { $in: ['Aided', 'SFM'] },
			semester: { $in: ['III', 'IV'] },
		});

		// --- PG WOMEN ---
		const pgFirstYearWomen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'PG',
			category: 'SFW',
			semester: { $in: ['I', 'II'] },
		});

		const pgSecondYearWomen = await ApplicationModel.countDocuments({
			academicYear,
			graduate: 'PG',
			category: 'SFW',
			semester: { $in: ['III', 'IV'] },
		});

		// Response Data
		res.json({
			ug: {
				men: [ugFirstYearMen, ugSecondYearMen, ugThirdYearMen],
				women: [ugFirstYearWomen, ugSecondYearWomen, ugThirdYearWomen],
			},
			pg: {
				men: [pgFirstYearMen, pgSecondYearMen],
				women: [pgFirstYearWomen, pgSecondYearWomen],
			},
		})

	} catch (error) {
		console.error("Error fetching dashboard bar data:", error);
		res.status(500).json({ message: 'Error fetching dashboard bar data' });
	}
}

// ----------------------------------------------------------------------------------------------------------------

module.exports = { fetchCardData, fetchPieData, fetchBarData };