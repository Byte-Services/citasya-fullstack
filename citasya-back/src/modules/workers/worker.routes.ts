import { Router } from 'express';
import { WorkerController } from './worker.controller.js';

const router = Router();
const workerController = new WorkerController();

router.get('/', workerController.getAllWorkers);
router.get('/:id', workerController.getWorkerById);
router.post('/', workerController.createWorker);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);

export default router;
