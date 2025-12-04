import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { Injectable } from '@nestjs/common';

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  deleteOne(filter: FilterQuery<T>): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}

@Injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    const query = this.model.find(filter);

    if (options?.limit) query.limit(options.limit);
    if (options?.skip) query.skip(options.skip);
    if (options?.sort) query.sort(options.sort);

    return query.exec();
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteOne(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.findOneAndDelete(filter).exec();
    return !!result;
  }

  async count(filter?: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter || {}).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}
