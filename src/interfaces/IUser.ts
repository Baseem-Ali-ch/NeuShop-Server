export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}
