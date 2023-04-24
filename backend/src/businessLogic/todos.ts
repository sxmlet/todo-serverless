import { TodosAccess } from '../dataLayer/todosAccess';
 import { Attachment } from '../dataLayer/attachment';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'
import * as createError from 'http-errors'
import { RESPONSE_BAD_REQUEST } from '../helpers/response'

const todoAccess = new TodosAccess()
const attachment = new Attachment();
const logger = createLogger('todo-service');

export async function createTodo(userId: string, data: CreateTodoRequest): Promise<TodoItem> {
  validateBody(data);

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

/**
 * Validates the request data.
 *
 * @param body
 *   The request body to validate.
 */
function validateBody(body: CreateTodoRequest): void {
  if (body.name == '') {
    throw createError(RESPONSE_BAD_REQUEST, 'name should not be empty');
  }

  if (body.dueDate == '') {
    throw createError(RESPONSE_BAD_REQUEST, 'dueDate should not be empty');
  }

  const dueDate = new Date(body.dueDate);
  if (dueDate.toString() === 'Invalid Date') {
    throw createError(RESPONSE_BAD_REQUEST, 'dueDate should be valid date');
  }

  if (dueDate < new Date(Date.now())) {
    throw createError(RESPONSE_BAD_REQUEST, 'dueDate should be higher than current date');
  }
}
