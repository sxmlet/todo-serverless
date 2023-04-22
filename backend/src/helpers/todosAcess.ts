import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest.js'
import { TodoUpdate } from '../models/TodoUpdate.js'
import { createHash } from 'crypto'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly client: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly tableName = process.env.TODOS_TABLE) {
  }

  async getAllTodoItems(): Promise<TodoItem[]> {
    const result = await this.client.scan({
      TableName: this.tableName
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem|null> {
    try {
      await this.client.put({
        TableName: this.tableName,
        Item: todo,
      }).promise()
      logger.info('create new item with name ' + todo.name + 'and id ' + todo.todoId)
    } catch (e) {
      logger.error('failed to create new item, error: ' +  JSON.stringify(e))
      return null;
    }
    return todo
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    let resp = null;
    try {
      resp = await this.client.delete({
        TableName: this.tableName,
        Key: { todoId: todoId },
        ConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
          ':uid': userId,
        },
      }).promise()
    } catch (e) {
      logger.info('delete todo item with id:', e)
      return;
    }

    logger.info(JSON.stringify(resp.$response.data));
  }

  async getAllTodoItemsForUser(userId: string): Promise<Array<TodoItem>> {
    const result = await this.client.query({
      TableName: this.tableName,
      IndexName: process.env.TODOS_CREATED_AT_INDEX,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as TodoItem[]
  }

  /**
   * Updates the provided item in dynamoDB.
   *
   * Creates a hashed name attribute to make sure that the attribute names are
   * not reserved.
   *
   * @param userId
   * @param todoId
   * @param data
   */
  async updateTodoItem(userId: string, todoId: string, data: UpdateTodoRequest): Promise<TodoUpdate> {
    let hash = createHash('sha1');
    hash.update(todoId);
    const digest = hash.digest('hex');
    const expAttr = {
      ':userId': userId,
    };
    const updateExpr = [];
    const expAttrNames = {};
    for (let d in data) {
      expAttr[`:${d}`] = data[d];
      let hashedAttr = digest + `${d}`;
      // The random hash makes sure that the attribute name is not reserved.
      expAttrNames[`#${hashedAttr}`] = d;
      updateExpr.push(`#${hashedAttr} = :${d}`);
    }

    await this.client.update({
      TableName: this.tableName,
      Key: { todoId: todoId },
      ConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: expAttrNames,
      ExpressionAttributeValues: expAttr,
      UpdateExpression: 'SET ' + updateExpr.join(','),
    }).promise();
    return data;
  }
}
