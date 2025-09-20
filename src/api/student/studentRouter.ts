import { Router } from "express";
import { AppDataSource } from "../../configs/typeorm.config";
import { Student } from "../../common/entities/student.entity";

const router = Router();
const studentRepo = AppDataSource.getRepository(Student);

// GET /students → all students
router.get("/", async (req, res) => {
  const students = await studentRepo.find();
  res.json(students);
});

// GET /students/:id → 1 student
router.get("/:id", async (req, res) => {
  const student = await studentRepo.findOneBy({ id: Number(req.params.id) });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  res.json(student);
});

export default router;
