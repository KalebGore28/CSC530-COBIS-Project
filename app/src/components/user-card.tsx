import React from 'react';
import { User } from '@/types/user'; // Adjust path if needed
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, Building, BriefcaseBusiness, CheckCircle, XCircle, Power, PowerOff } from 'lucide-react'; // Example icons

interface UserCardProps {
  user: User;
  onToggleEnable: (userId: string, currentStatus: boolean) => void;
  isToggling: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onToggleEnable, isToggling }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleToggle = () => {
    onToggleEnable(user.id, user.isEnabled);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription className="flex items-center space-x-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          {user.isEnabled ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>Status:</span>
          <Badge variant={user.isEnabled ? 'default' : 'destructive'}>
            {user.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        {user.mnumber && (
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span>M-Number: {user.mnumber}</span>
          </div>
        )}
         {user.college && user.department && (
           <div className="flex items-center space-x-2">
             <Building className="h-4 w-4 text-muted-foreground" />
             <span>College: {user.college}</span>
           </div>
         )}
        {user.department && user.college && (
          <div className="flex items-center space-x-2">
             <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
             <span>Department: {user.department}</span>
           </div>
        )}
         <div className="pt-2">
            <p className="font-medium mb-1">Roles:</p>
             {user.roles && user.roles.length > 0 ? (
                 <div className="flex flex-wrap gap-1">
                     {user.roles.map((role) => (
                       <Badge key={role.role_id} variant="outline">{role.role_name}</Badge>
                     ))}
                 </div>
             ) : (
                 <span className="text-muted-foreground italic">No roles assigned</span>
             )}
         </div>
      </CardContent>
      <CardFooter>
        <Button
          variant={user.isEnabled ? 'destructive' : 'default'}
          size="sm"
          onClick={handleToggle}
          disabled={isToggling}
          className="w-full sm:w-auto"
        >
          {isToggling ? (
            'Processing...'
          ) : user.isEnabled ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" /> Disable User
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" /> Enable User
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard; 