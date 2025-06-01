// Inracker/src/app/components/CreateOpponentDrawer.tsx
import React from 'react';

import { useOpponentStore } from '../stores/useOpponentStore';

interface CreateOpponentDrawerProps {
  onClose: () => void;
  isOpen: boolean;
}

const CreateOpponentDrawer: React.FC<CreateOpponentDrawerProps> = ({ onClose, isOpen }) => {
  const [name, setName] = React.useState('');
  const createOpponent = useOpponentStore((state) => state.createOpponent);
  const isLoading = useOpponentStore((state) => state.isLoading);

  const handleCreate = async () => {
    await createOpponent(name);
    setName('');
    onClose();
  };

  return (
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      <h2>Create New Opponent</h2>
      <input
        type="text"
        placeholder="Opponent Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default CreateOpponentDrawer;
