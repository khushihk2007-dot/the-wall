import React, { useState } from 'react';
import { 
  Plus, 
  Info
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { farmService } from '../../../services/farmService';

export function CalibrationPanel({ calibrations = [], onCalibrationAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calibList, setCalibList] = useState(calibrations);

  const [formData, setFormData] = useState({
    sensorId: 'SENSOR-ADC-CH1',
    sensorName: 'Capacitive Soil Probe (Channel 1)',
    sensorType: 'Moisture (Capacitive)',
    method: '2-Point Dry/Wet Bench Calibration',
    dryAdc: 3250,
    wetAdc: 1380,
    notes: 'Bench tested in air and water cup at 25°C.',
    nextDueDate: '2027-02-25',
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = farmService.addCalibration(formData);
    setCalibList(result.all);
    if (onCalibrationAdded) onCalibrationAdded(result.calibration);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Hardware Sensor Calibration Logs"
        subtitle="Benchmark analog-to-digital conversions and physical reference calibrations."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Calibration</span>
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-sand-200 text-sand-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Calibration ID</th>
                <th className="py-2.5 px-3">Sensor Probe</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Calibrated On</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {calibList.map((cal) => (
                <tr key={cal.id} className="hover:bg-sand-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-sand-800">{cal.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-sand-900">{cal.sensorName}</div>
                    <div className="text-[11px] font-mono text-sand-500">{cal.sensorId}</div>
                  </td>
                  <td className="py-3 px-3 text-sand-700">{cal.sensorType}</td>
                  <td className="py-3 px-3 text-sand-600">
                    <div>{cal.method}</div>
                    {cal.dryAdc && (
                      <span className="text-[10px] font-mono text-sand-400">
                        Dry ADC: {cal.dryAdc} | Wet ADC: {cal.wetAdc}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sand-600">{cal.calibrationDate}</td>
                  <td className="py-3 px-3">
                    <Badge variant="success" size="xs">
                      {cal.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-sand-600 font-mono text-[11px]">{cal.nextDueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between text-xs text-sand-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sand-400" />
            <span>Capacitive probes require 2-point reference mapping (Air Dry Raw ADC vs Submerged Wet Raw ADC).</span>
          </div>
          <Badge variant="neutral" size="xs">ISO 17025 Procedure</Badge>
        </div>
      </Card>

      {/* Record Calibration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Record Sensor Calibration"
        subtitle="Log physical bench calibration parameters into the platform."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Sensor Target"
            value={formData.sensorId}
            onChange={(e) => {
              const val = e.target.value;
              let name = 'Capacitive Soil Probe (Channel 1)';
              let type = 'Moisture (Capacitive)';
              if (val === 'SENSOR-TEMP-01') {
                name = 'Core Bed Probe (DS18B20)';
                type = 'Temperature (OneWire)';
              } else if (val === 'SENSOR-ULTRA-01') {
                name = 'Ultrasonic Distance (HC-SR04)';
                type = 'Distance (Ultrasonic)';
              }
              setFormData((prev) => ({
                ...prev,
                sensorId: val,
                sensorName: name,
                sensorType: type,
              }));
            }}
            options={[
              { value: 'SENSOR-ADC-CH1', label: 'Channel 1 Top Soil Probe (ESP32 GPIO 34)' },
              { value: 'SENSOR-TEMP-01', label: 'Core Bed Temperature (DS18B20 GPIO 4)' },
              { value: 'SENSOR-ULTRA-01', label: 'Ultrasonic Distance Sensor (HC-SR04 GPIO 5/18)' },
            ]}
          />

          <Select
            label="Calibration Methodology"
            value={formData.method}
            onChange={(e) => setFormData((prev) => ({ ...prev, method: e.target.value }))}
            options={[
              { value: '2-Point Dry/Wet Bench Calibration', label: '2-Point Dry/Wet Bench (Air & Water Reference)' },
              { value: '1-Point Zero Offset Offset', label: '1-Point Zero Offset' },
              { value: 'Physical Caliper Benchmark', label: 'Physical Caliper Benchmark (Ultrasonic)' },
              { value: 'Factory Multi-point Trim', label: 'Factory Multi-point Trim' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dry Reference Raw ADC (Air)"
              type="number"
              value={formData.dryAdc}
              onChange={(e) => setFormData((prev) => ({ ...prev, dryAdc: Number(e.target.value) }))}
              placeholder="e.g. 3250"
            />
            <Input
              label="Wet Reference Raw ADC (Water)"
              type="number"
              value={formData.wetAdc}
              onChange={(e) => setFormData((prev) => ({ ...prev, wetAdc: Number(e.target.value) }))}
              placeholder="e.g. 1380"
            />
          </div>

          <Input
            label="Next Due Date"
            type="date"
            value={formData.nextDueDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, nextDueDate: e.target.value }))}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-sand-700">Calibration Notes &amp; Environment</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-sand-300 focus:ring-1 focus:ring-forest-600 focus:border-forest-600"
              placeholder="Room temp 25°C, relative humidity 50%..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Calibration Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
