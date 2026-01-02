import React, { useState, useEffect } from 'react';
import ProductSelectionStep from './ProductSelectionStep';
import DateTimeSelectionStep from './DateTimeSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import ThankYouStep from './ThankYouStep';
import { appointmentService } from '../../services/appointment.service';

const STEPS = ['products', 'datetime', 'confirmation', 'thankyou'];

const AppointmentWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    items: [],
    selectedDate: null,
    selectedTime: null,
    clientType: 'new',
    clientId: null,
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  });
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    loadSubcategories();
  }, []);

  const loadSubcategories = async () => {
    try {
      const data = await appointmentService.getSubcategories();
      setSubcategories(data);
    } catch (err) {
      setError('Error al cargar subcategorias');
    } finally {
      setLoading(false);
    }
  };

  const validateProducts = () => {
    const items = wizardData.items;

    if (items.length === 0) {
      return {
        valid: false,
        type: 'empty',
        message: 'Agrega al menos un producto para continuar'
      };
    }

    // Check if all items are excellent quality
    const hasNonExcellent = items.some(item => !item.isExcellent);
    if (hasNonExcellent) {
      return {
        valid: false,
        type: 'quality',
        message: 'Solo compramos articulos en excelente estado. Por favor marca todos los productos como "Excelente calidad".'
      };
    }

    // Check for disabled subcategories
    const disabledItem = items.find(item => !item.subcategory?.purchasing_enabled);
    if (disabledItem) {
      return {
        valid: false,
        type: 'disabled',
        message: `No estamos comprando "${disabledItem.subcategory?.name}" por el momento. Por favor selecciona otra categoria.`
      };
    }

    // Calculate totals
    const clothingItems = items
      .filter(item => item.subcategory?.is_clothing)
      .reduce((sum, item) => sum + item.quantity, 0);
    const nonClothingItems = items
      .filter(item => item.subcategory && !item.subcategory.is_clothing)
      .reduce((sum, item) => sum + item.quantity, 0);

    // Check minimum requirements
    if (clothingItems > 0 && clothingItems < 20 && nonClothingItems === 0) {
      return {
        valid: false,
        type: 'minimum',
        message: 'Para ropa necesitas al menos 20 prendas para agendar cita. Puedes traernos directamente a la tienda cantidades menores.'
      };
    }

    if (nonClothingItems > 0 && nonClothingItems < 5 && clothingItems === 0) {
      return {
        valid: false,
        type: 'minimum',
        message: 'Necesitas al menos 5 articulos para agendar cita. Puedes traernos directamente a la tienda cantidades menores.'
      };
    }

    if (clothingItems > 0 && nonClothingItems > 0) {
      if (clothingItems < 20 && nonClothingItems < 5) {
        return {
          valid: false,
          type: 'minimum',
          message: 'Necesitas al menos 5 articulos (no ropa) o 20 prendas de ropa para agendar cita.'
        };
      }
    }

    return { valid: true };
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const validation = validateProducts();
      setValidationResult(validation);
      if (!validation.valid) return;
    }
    setValidationResult(null);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setValidationResult(null);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await appointmentService.createAppointment(wizardData);
      setCreatedAppointment(response.data);
      setCurrentStep(3);
    } catch (err) {
      setError(err.message || 'Error al crear la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'products':
        return (
          <ProductSelectionStep
            subcategories={subcategories}
            items={wizardData.items}
            onChange={(items) => setWizardData(prev => ({ ...prev, items }))}
            validationResult={validationResult}
            onNext={handleNext}
          />
        );
      case 'datetime':
        return (
          <DateTimeSelectionStep
            wizardData={wizardData}
            onChange={(data) => setWizardData(prev => ({ ...prev, ...data }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            wizardData={wizardData}
            subcategories={subcategories}
            onConfirm={handleSubmit}
            onBack={handleBack}
            submitting={submitting}
          />
        );
      case 'thankyou':
        return <ThankYouStep appointment={createdAppointment} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Agenda tu cita de valuacion
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Valuamos tus articulos infantiles usados en excelente estado
        </p>
      </div>

      {/* Progress indicator */}
      {currentStep < 3 && (
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['Productos', 'Fecha y Hora', 'Confirmacion'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      index <= currentStep
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-xs mt-1 ${
                    index <= currentStep ? 'text-pink-500' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Current step content */}
      {renderStep()}
    </div>
  );
};

export default AppointmentWizard;
