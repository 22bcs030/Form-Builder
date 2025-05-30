import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceFrameProps {
  children: React.ReactNode;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ 
  children, 
  device, 
  onDeviceChange 
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-center space-x-2">
        <button
          onClick={() => onDeviceChange('mobile')}
          className={cn(
            "btn-ghost rounded-md p-2",
            device === 'mobile' && "bg-primary/10 text-primary"
          )}
          aria-label="Mobile preview"
        >
          <Smartphone size={20} />
        </button>
        <button
          onClick={() => onDeviceChange('tablet')}
          className={cn(
            "btn-ghost rounded-md p-2",
            device === 'tablet' && "bg-primary/10 text-primary"
          )}
          aria-label="Tablet preview"
        >
          <Tablet size={20} />
        </button>
        <button
          onClick={() => onDeviceChange('desktop')}
          className={cn(
            "btn-ghost rounded-md p-2",
            device === 'desktop' && "bg-primary/10 text-primary"
          )}
          aria-label="Desktop preview"
        >
          <Monitor size={20} />
        </button>
      </div>
      
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        <div
          className={cn(
            "mx-auto h-full overflow-auto rounded-md border border-border bg-background transition-all",
            device === 'mobile' && "w-full max-w-[375px]",
            device === 'tablet' && "w-full max-w-[768px]",
            device === 'desktop' && "w-full max-w-[1280px]"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;