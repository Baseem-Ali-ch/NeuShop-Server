import { HttpStatusCode } from "../../constants/httpStatusCodes";
import { StatusMessage } from "../../constants/responseMessages";
import { UserModel } from "../../models/User";

export const getAllCustomers = async (req: any, res: any): Promise<any> => {
  try {
    const admin_id = req.user.id;
    if (!admin_id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: StatusMessage.UNAUTHORIZED,
      });
    }
    // Fetch orders for the user
    const customers = await UserModel.find();
    if (!customers || customers.length === 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: StatusMessage.NOT_FOUND,
      });
    }
    res.status(HttpStatusCode.OK).json({
      message: StatusMessage.SUCCESS,
      customers,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: StatusMessage.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Deactivate a customer
export const activateCustomer = async (req: any, res: any): Promise<any> => {
  try {
    const { id } = req.params;

    const customer = await UserModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!customer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: "Customer not found." });
    }

    res.status(HttpStatusCode.OK).json({ message: "Customer activated successfully." });
  } catch (error) {
    console.error("Error activating customer:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to activate customer." });
  }
};


// Deactivate a customer
export const deactivateCustomer = async (req: any, res: any): Promise<any> => {
  try {
    const { id } = req.params;

    const customer = await UserModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: "Customer not found." });
    }

    res.status(HttpStatusCode.OK).json({ message: "Customer deactivated successfully." });
  } catch (error) {
    console.error("Error deactivating customer:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to deactivate customer." });
  }
};

// Delete a customer
export const deleteCustomer = async (req: any, res: any): Promise<any> => {
  try {
    const { id } = req.params;

    const customer = await UserModel.findByIdAndDelete(id);

    if (!customer) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ message: "Customer not found." });
    }

    res.status(HttpStatusCode.OK).json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete customer." });
  }
};
