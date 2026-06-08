import type { CourseRepository, EnrollmentRepository } from './repositories.js';
import type {
  CertificateStatus,
  Course,
  Enrollment,
  EnrollmentStatus,
  RejectEnrollmentResult,
} from './types.js';

type MongoCollection<T> = {
  findOne(query: Record<string, unknown>): Promise<T | null>;
  insertOne(document: T): Promise<unknown>;
  updateOne(query: Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
  countDocuments(query: Record<string, unknown>): Promise<number>;
};

type CourseDocument = {
  _id?: unknown;
  id: string;
  title: string;
  status: 'open' | 'OPEN' | 'closed' | 'CLOSED';
  seatLimit: number;
  enrolledCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type EnrollmentDocument = {
  _id?: unknown;
  id: string;
  employeeId: string;
  courseId: string;
  status: EnrollmentStatus;
  certificateStatus?: CertificateStatus;
  certificateUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function mapCourse(doc: CourseDocument | null): Course | null {
  if (!doc) return null;

  return {
    id: doc.id,
    title: doc.title,
    status: String(doc.status).toUpperCase() === 'OPEN' ? 'OPEN' : 'CLOSED',
    seatLimit: doc.seatLimit,
    enrolledCount: doc.enrolledCount,
  };
}

function mapEnrollment(doc: EnrollmentDocument | null): Enrollment | null {
  if (!doc) return null;

  return {
    id: doc.id,
    employeeId: doc.employeeId,
    courseId: doc.courseId,
    status: doc.status,
    certificateStatus: doc.certificateStatus,
    certificateUrl: doc.certificateUrl,
  };
}

export class MongoCourseRepository implements CourseRepository {
  constructor(private readonly collection: MongoCollection<CourseDocument>) {}

  async findById(courseId: string): Promise<Course | null> {
    const doc = await this.collection.findOne({ id: courseId });
    return mapCourse(doc);
  }
}

export class MongoEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly collection: MongoCollection<EnrollmentDocument>) {}

  private async nextEnrollmentId(): Promise<string> {
    const count = await this.collection.countDocuments({});
    return `ENR${String(count + 1).padStart(3, '0')}`;
  }

  async findActiveByEmployeeAndCourse(
    employeeId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    const doc = await this.collection.findOne({
      employeeId,
      courseId,
      status: { $in: ['PENDING_APPROVAL', 'APPROVED'] },
    });

    return mapEnrollment(doc);
  }

  async create(input: {
    employeeId: string;
    courseId: string;
    status: EnrollmentStatus;
  }): Promise<Enrollment> {
    const now = new Date();
    const document: EnrollmentDocument = {
      id: await this.nextEnrollmentId(),
      employeeId: input.employeeId,
      courseId: input.courseId,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.insertOne(document);
    return document;
  }

  async findById(enrollmentId: string): Promise<Enrollment | null> {
    const doc = await this.collection.findOne({ id: enrollmentId });
    return mapEnrollment(doc);
  }

  async approve(input: {
    enrollmentId: string;
    approvedBy: string;
    approvedAt: string;
  }) {
    await this.collection.updateOne(
      { id: input.enrollmentId },
      {
        $set: {
          status: 'APPROVED',
          approvedBy: input.approvedBy,
          approvedAt: input.approvedAt,
          updatedAt: new Date(input.approvedAt),
        },
      },
    );

    return {
      enrollmentId: input.enrollmentId,
      status: 'APPROVED' as const,
      approvedBy: input.approvedBy,
      approvedAt: input.approvedAt,
    };
  }

  async reject(input: {
    enrollmentId: string;
    rejectedBy: string;
    rejectedAt: string;
  }): Promise<RejectEnrollmentResult> {
    await this.collection.updateOne(
      { id: input.enrollmentId },
      {
        $set: {
          status: 'REJECTED',
          rejectedBy: input.rejectedBy,
          rejectedAt: input.rejectedAt,
          updatedAt: new Date(input.rejectedAt),
        },
      },
    );

    return {
      enrollmentId: input.enrollmentId,
      status: 'REJECTED' as const,
      rejectedBy: input.rejectedBy,
      rejectedAt: input.rejectedAt,
    };
  }

  async updateCertificateStatus(input: {
    enrollmentId: string;
    certificateStatus: CertificateStatus;
    certificateUrl?: string;
  }): Promise<void> {
    await this.collection.updateOne(
      { id: input.enrollmentId },
      {
        $set: {
          certificateStatus: input.certificateStatus,
          certificateUrl: input.certificateUrl,
          updatedAt: new Date(),
        },
      },
    );
  }
}
