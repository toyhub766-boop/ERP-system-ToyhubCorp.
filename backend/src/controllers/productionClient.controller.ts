import { Request, Response } from "express";
import ProductionClient from "../models/ProductionClient";

export const getProductionClients = async (
  _req: Request,
  res: Response
) => {
  try {
    const clients =
      await ProductionClient.find()
        .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch production clients",
    });
  }
};

export const getProductionClientById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const client =
        await ProductionClient.findById(
          req.params.id
        );

      if (!client) {
        return res.status(404).json({
          message:
            "Production client not found",
        });
      }

      res.json(client);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch production client",
      });
    }
  };

export const createProductionClient =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        contactPerson,
        phone,
        address,
        transport,
        notes,
      } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          message:
            "Client name is required",
        });
      }

      const client =
        await ProductionClient.create({
          name: name.trim(),
          contactPerson:
            contactPerson || "",
          phone: phone || "",
          address: address || "",
          transport: transport || "",
          notes: notes || "",
        });

      res.status(201).json(client);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to create production client",
      });
    }
  };

export const updateProductionClient =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const client =
        await ProductionClient.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!client) {
        return res.status(404).json({
          message:
            "Production client not found",
        });
      }

      res.json(client);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update production client",
      });
    }
  };

export const deleteProductionClient =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const client =
        await ProductionClient.findByIdAndDelete(
          req.params.id
        );

      if (!client) {
        return res.status(404).json({
          message:
            "Production client not found",
        });
      }

      res.json({
        message:
          "Production client deleted",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete production client",
      });
    }
  };