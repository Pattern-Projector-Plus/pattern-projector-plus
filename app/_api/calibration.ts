import axios from 'axios';
import config from '@config';


const API_BASE_URL = config.apiBaseUrl

export const getCalibrationSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/calibration-settings`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving calibration settings:', error);
    throw error;
  }
};

export const createCalibrationSettings = async (name: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calibration-settings`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating calibration settings:', error);
    throw error;
  }
};

export const updateCalibrationSettings = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/calibration-settings/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating calibration settings:', error);
    throw error;
  }
};

export const deleteCalibrationSettings = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/calibration-settings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting calibration settings:', error);
    throw error;
  }
};
