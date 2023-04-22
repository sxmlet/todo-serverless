import { TodosAccess } from './todosAcess'
 import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate.js'
import * as createError from 'http-errors'

const todoAccess = new TodosAccess()
const attachment = new AttachmentUtils();
const logger = createLogger('todo-service');

export async function createTodo(userId: string, data: CreateTodoRequest): Promise<TodoItem> {
  const todoItem: TodoItem = {
    name: data.name,
    dueDate: data.dueDate,
    userId: userId,
    createdAt: Date.now().toString(),
    done: false,
    todoId: uuid.v4(),
  }
  try {
    await todoAccess.createTodoItem(todoItem)
    return todoItem;
  } catch (e) {
    logger.info(JSON.stringify(e));
    throw createError(500, 'Internal Server Error');
  }
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  try {
    await todoAccess.deleteTodoItem(userId, todoId)
  } catch (e) {
    logger.info(JSON.stringify(e));
    throw createError(500, 'Internal Server Error');
  }
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
  try {
    return await attachment.getPresignedUrl(todoId);
  } catch (e) {
    logger.info(JSON.stringify(e));
    throw createError(500, 'Internal Server Error');
  }
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  try {
    return await todoAccess.getAllTodoItemsForUser(userId);
  } catch (e) {
    logger.info(JSON.stringify(e));
    throw createError(500, 'Internal Server Error');
  }
}

export async function updateTodo(userId: string, todoId: string, data: UpdateTodoRequest): Promise<TodoUpdate> {
  try {
    return await todoAccess.updateTodoItem(userId, todoId, data);
  } catch (e) {
    logger.info(JSON.stringify(e));
    throw createError(500, 'Internal Server Error');
  }
}
