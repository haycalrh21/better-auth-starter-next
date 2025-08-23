// Export all schemas and types from teacher schema files

// Export from guruSchema (base schemas)
export {
  createGuruSchema,
  guruFilterSchema,
  deleteGuruSchema,
  bulkGuruSchema,
  importGuruSchema,
  userCreateSchema,
  guruSchema,
} from "./guruSchema";

export type {
  CreateGuruInput,
  GuruFilterInput,
  DeleteGuruInput,
  BulkGuruInput,
  ImportGuruInput,
  UserCreateInput,
  GuruFormValues,
} from "./guruSchema";

// Export from editGuruSchema (extended schemas) - these take precedence
export {
  editGuruSchema,
  completeGuruProfileSchema,
  updateEmploymentStatusSchema,
  assignTeacherToClassSchema,
  assignSubjectToTeacherSchema,
  teacherEvaluationSchema,
} from "./editGuruSchema";

export type {
  EditGuruInput,
  CompleteGuruProfileInput,
  UpdateEmploymentStatusInput,
  AssignTeacherToClassInput,
  AssignSubjectToTeacherInput,
  TeacherEvaluationInput,
} from "./editGuruSchema";
