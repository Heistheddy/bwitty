import React, { useState, useEffect } from 'react';
import { MapPin, Plus, CreditCard as Edit2, Trash2, Check } from 'lucide-react';
import { shippingService, ShippingAddress } from '../lib/shipping';
import { useToast } from '../hooks/use-toast';

interface ShippingAddressManagerProps {
  userId: string;
}

const ShippingAddressManager: React.FC<ShippingAddressManagerProps> = ({ userId }) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      const data = await shippingService.getUserAddresses(userId);
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping addresses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria',
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: ShippingAddress) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code || '',
      country: address.country,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await shippingService.updateAddress(editingId, formData);
        toast({
          title: 'Address Updated',
          description: 'Shipping address updated successfully',
        });
      } else {
        await shippingService.addAddress(formData);
        toast({
          title: 'Address Added',
          description: 'New shipping address added successfully',
        });
      }
      loadAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shipping address',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await shippingService.deleteAddress(id);
      toast({
        title: 'Address Deleted',
        description: 'Shipping address deleted successfully',
      });
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shipping address',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await shippingService.setDefaultAddress(id);
      toast({
        title: 'Default Address Updated',
        description: 'Default shipping address updated successfully',
      });
      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Addresses</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'New Address'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
              <input
                type="text"
                required
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {editingId ? 'Update' : 'Save'} Address
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 ${
                address.is_default ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-gray-900">{address.full_name}</p>
                      {address.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{address.phone}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {address.city}, {address.state}
                      {address.postal_code && ` ${address.postal_code}`}
                    </p>
                    <p className="text-gray-600 text-sm">{address.country}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-600">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No shipping addresses saved yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressManager;
