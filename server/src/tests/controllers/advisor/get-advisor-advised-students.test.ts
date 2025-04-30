// advisor.getAdvisedStudents.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { AdvisorController } from '../../../controllers/advisor-controller';
import { AdvisorService } from '../../../services/advisor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';
import { UtilityService } from '../../../services/utility-service';

// 1) Mock advisor‐service
vi.mock('../../../services/advisor-service', () => {
	const mockGetAdvisedStudentsFn = vi.fn();
	return {
		AdvisorService: {
			getAdvisedStudents: mockGetAdvisedStudentsFn,
		},
	};
});

// 2) Mock utility‐service (so getCurrentTermAndYear is a vi.fn())
vi.mock('../../../services/utility-service', () => ({
	UtilityService: {
		getCurrentTermAndYear: vi.fn(),
	},
}));

let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;
const targetAdvisorMnumber = 'M87654321';

beforeEach(() => {
	vi.clearAllMocks();

	// now this is a real mock fn:
	const mockGetCurrentTermAndYear = UtilityService.getCurrentTermAndYear as Mock;
	mockGetCurrentTermAndYear.mockResolvedValue({
		term: 'Fall',
		year: 2025,
		termName: 'Fall 2025',
	});

	mockReq = {
		params: { mnumber: targetAdvisorMnumber },
		query: {},
	};
	mockRes = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
});

describe('AdvisorController.getAdvisedStudents', () => {
	it('returns 400 on invalid year format', async () => {
		mockReq.query = { year: 'not-a-year' };
		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);
		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object),
			})
		);
	});

	it('returns 400 on non-positive year', async () => {
		mockReq.query = { year: '0' };
		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);
		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
	});

	it('calls service & wraps JSON on full valid query', async () => {
		const mockStudents = [{ studentId: 10, name: 'Eve' }];
		mockReq.query = { term: 'Summer II', year: '2023' };
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(
			mockStudents
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: 'Summer II',
			year: 2023,
		});

		expect(mockRes.json).toHaveBeenCalledWith({
			advisedStudents: mockStudents,
			term: 'Summer II',
			year: 2023,
			termName: 'Fall 2025',  // from our mockGetCurrentTermAndYear
		});

		// status(…) should *not* be called on success
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('accepts numeric year in query directly', async () => {
		const mockStudents = [{ studentId: 10, name: 'Eve' }];
		// @ts-ignore
		mockReq.query = { term: 'Summer II', year: 2023 };
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(
			mockStudents
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		expect(mockRes.json).toHaveBeenCalledWith({
			advisedStudents: mockStudents,
			term: 'Summer II',
			year: 2023,
			termName: 'Fall 2025',
		});
	});

	it('defaults to only term if year omitted', async () => {
		const mockStudents = [{ studentId: 11, name: 'Frank' }];
		mockReq.query = { term: 'Winter' };
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(
			mockStudents
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		// now year should default to 2025
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: 'Winter',
			year: 2025,
		});

		expect(mockRes.json).toHaveBeenCalledWith({
			advisedStudents: mockStudents,
			term: 'Winter',
			year: 2025,
			termName: 'Fall 2025',
		});
	});

	it('defaults to only year if term omitted', async () => {
		const mockStudents = [{ studentId: 12, name: 'Grace' }];
		mockReq.query = { year: '2026' };
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(
			mockStudents
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		// now term should default to 'Fall'
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: 'Fall',
			year: 2026,
		});

		expect(mockRes.json).toHaveBeenCalledWith({
			advisedStudents: mockStudents,
			term: 'Fall',
			year: 2026,
			termName: 'Fall 2025',
		});
	});


	it('defaults to current term/year when neither provided', async () => {
		const mockStudents = [{ studentId: 13, name: 'Heidi' }];
		mockReq.query = {};
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(
			mockStudents
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		// Should have picked up the mock currentTerm/currentYear
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: 'Fall',
			year: 2025,
		});
		expect(mockRes.json).toHaveBeenCalledWith({
			advisedStudents: mockStudents,
			term: 'Fall',
			year: 2025,
			termName: 'Fall 2025',
		});
	});

	it('returns 500 on service error', async () => {
		mockReq.query = { term: 'Maymester' };
		(AdvisorService.getAdvisedStudents as Mock).mockRejectedValue(
			new Error('Data fetch failed')
		);

		await AdvisorController.getAdvisedStudents(
			mockReq as Request,
			mockRes as Response
		);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Internal server error while fetching advised students.',
		});
	});
});
