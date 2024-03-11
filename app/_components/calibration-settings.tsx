import { useTranslations } from "next-intl";
import React, { useState, useEffect } from 'react';
import { getCalibrationSettings, createCalibrationSettings, updateCalibrationSettings, deleteCalibrationSettings } from '@/_api/calibration';
import { Point } from "@/_lib/point";
import Tooltip from "@/_components/tooltip/tooltip";
import { IconButton } from "@/_components/buttons/icon-button";
import SelectCalibrationIcon from "@/_icons/select-calibration-icon";
import SaveCalibrationIcon from "@/_icons/save-calibration-icon";
import DeleteIcon from "@/_icons/delete-icon";

interface CalibrationSettingsComponentProps {
  points: Point[];
  onCalibrationSave: (calibrationData: any) => void;
  onCalibrationLoad: (calibrationData: any) => void;
}

const CalibrationSettingsComponent: React.FC<CalibrationSettingsComponentProps> = ({
  points,
  onCalibrationSave,
  onCalibrationLoad,
}) => {
  const [calibrationSettings, setCalibrationSettings] = useState<any[]>([]);
  const [selectedCalibration, setSelectedCalibration] = useState<any | null>(null);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newCalibrationName, setNewCalibrationName] = useState('');
  const [calibrationToDelete, setCalibrationToDelete] = useState<any | null>(null);
  const [originalPoints, setOriginalPoints] = useState<Point[]>([]); // New state for tracking original points of the selected calibration

  //const t = useTranslations("Header");
  useEffect(() => {
    if (selectedCalibration) {
      const loadedPoints: Point[] = [
	{ x: selectedCalibration.x1, y: selectedCalibration.y1 },
	{ x: selectedCalibration.x2, y: selectedCalibration.y2 },
	{ x: selectedCalibration.x3, y: selectedCalibration.y3 },
	{ x: selectedCalibration.x4, y: selectedCalibration.y4 },
      ];
      setOriginalPoints(loadedPoints); 
    }
  }, [selectedCalibration]);

  const pointsChanged = JSON.stringify(points) !== JSON.stringify(originalPoints); // Check if current points differ from original

  useEffect(() => {
    fetchCalibrationSettings();
  }, []);

  const fetchCalibrationSettings = async () => {
    try {
      const data = await getCalibrationSettings();
      setCalibrationSettings(data);
    } catch (error) {
      console.error('Error fetching calibration settings:', error);
    }
  };

  const handleSelectCalibration = (calibration: any) => {
    setSelectedCalibration(calibration);
    onCalibrationLoad(calibration);
    setIsSelectDialogOpen(false);
  };

  const handleCreateCalibration = async () => {
    try {
      const newCalibration = await createCalibrationSettings(newCalibrationName);
      setCalibrationSettings([...calibrationSettings, newCalibration]);
      setSelectedCalibration(newCalibration);
      onCalibrationLoad(newCalibration);
      setNewCalibrationName('');
      setIsSelectDialogOpen(false);
    } catch (error) {
      console.error('Error creating calibration settings:', error);
    }
  };

  const handleSaveCalibration = async () => {
    if (selectedCalibration) {
      try {
        const calibrationData = {
          ...selectedCalibration,
          x1: points[0].x,
          y1: points[0].y,
          x2: points[1].x,
          y2: points[1].y,
          x3: points[2].x,
          y3: points[2].y,
          x4: points[3].x,
          y4: points[3].y,
        };
        const updatedCalibration = await updateCalibrationSettings(selectedCalibration.id, calibrationData);
        setCalibrationSettings(
          calibrationSettings.map((calibration) =>
            calibration.id === updatedCalibration.id ? updatedCalibration : calibration
          )
        );
        onCalibrationSave(updatedCalibration);
	setOriginalPoints(points); 
        setIsSaveDialogOpen(false);
      } catch (error) {
        console.error('Error updating calibration settings:', error);
      }
    } else {
      setIsSaveDialogOpen(true);
    }
  };

  const handleOverwriteCalibration = async (calibrationId: number) => {
    try {
      const calibrationData = {
        ...selectedCalibration,
        x1: points[0].x,
        y1: points[0].y,
        x2: points[1].x,
        y2: points[1].y,
        x3: points[2].x,
        y3: points[2].y,
        x4: points[3].x,
        y4: points[3].y,
      };
      const updatedCalibration = await updateCalibrationSettings(calibrationId, calibrationData);
      setCalibrationSettings(
        calibrationSettings.map((calibration) =>
          calibration.id === updatedCalibration.id ? updatedCalibration : calibration
        )
      );
      onCalibrationSave(updatedCalibration);
      setIsSaveDialogOpen(false);
    } catch (error) {
      console.error('Error overwriting calibration settings:', error);
    }
  };

  const handleDeleteCalibration = async () => {
    if (calibrationToDelete) {
      try {
        await deleteCalibrationSettings(calibrationToDelete.id);
        setCalibrationSettings(
          calibrationSettings.filter((calibration) => calibration.id !== calibrationToDelete.id)
        );
        setCalibrationToDelete(null);
        setIsConfirmDeleteOpen(false);
      } catch (error) {
        console.error('Error deleting calibration settings:', error);
      }
    }
  };

  return (
    <>
      <span className={`px-3 py-1 rounded ${selectedCalibration ? 'text-black' : 'text-gray-400'}`}>
	{selectedCalibration ? `${selectedCalibration.name}${pointsChanged ? '*' : ''}` : 'Select calibration'}
      </span>
      <Tooltip description="Open Calibration Selection Menu">
        <IconButton
          onClick={() => setIsSelectDialogOpen(true)}
        >
          <SelectCalibrationIcon ariaLabel="calibration selection menu" />
        </IconButton>
      </Tooltip>
      <Tooltip description="Save Calibration">
        <IconButton onClick={handleSaveCalibration}>
          <SaveCalibrationIcon ariaLabel="save calibration" />
        </IconButton>
      </Tooltip>

      {isSelectDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-4">Select Calibration</h3>
            <ul className="space-y-2 mb-4">
              {calibrationSettings.map((calibration) => (
                <li
                  key={calibration.id}
                  className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 cursor-pointer"
		  onClick={() => handleSelectCalibration(calibration)}
                >
                  <span>
                    {calibration.name}
                  </span>
                  <IconButton
                    onClick={() => {
		      event.stopPropagation(); // Prevent click from propagating to parent
                      setCalibrationToDelete(calibration);
                      setIsConfirmDeleteOpen(true);
                    }}
                  >
                    <DeleteIcon ariaLabel="delete calibration" className="text-red-500" />
                  </IconButton>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCalibrationName}
                onChange={(e) => setNewCalibrationName(e.target.value)}
                placeholder="Enter calibration name"
                className="border border-gray-300 rounded-lg py-2 px-4 flex-grow"
              />
              <button
                onClick={handleCreateCalibration}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-4"
              >
                Create
              </button>
            </div>
            <button
              onClick={() => setIsSelectDialogOpen(false)}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 px-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isSaveDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-4">Save Calibration</h3>
            <input
              type="text"
              value={newCalibrationName}
              onChange={(e) => setNewCalibrationName(e.target.value)}
              placeholder="Enter calibration name"
              className="border border-gray-300 rounded-lg py-2 px-4 w-full mb-4"
            />
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Overwrite Existing Calibration</h4>
              <ul className="space-y-2">
                {calibrationSettings.map((calibration) => (
                  <li
                    key={calibration.id}
                    onClick={() => handleOverwriteCalibration(calibration.id)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 cursor-pointer"
                  >
                    {calibration.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCreateCalibration}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-4"
              >
                Save
              </button>
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete the calibration "{calibrationToDelete?.name}"?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCalibration}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4"
              >
                Yes
              </button>
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 px-4"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalibrationSettingsComponent;
