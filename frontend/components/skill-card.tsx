'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock } from 'lucide-react';
import { User, Skill } from '@/store/types';
import { useAppDispatch } from '@/store';
import {
  useAddSkillToFavoriteMutation,
  useRemoveSkillFromFavoriteMutation,
} from '@/store/skillSwapApi/skillSwapApi';

interface SkillCardProps {
  user: User;
  onLike?: (userId: string) => void;
  onClick?: (userId: string) => void;
  onViewDetails?: (skillId: string) => void;
  isExchangeProposed?: boolean;
  currentUser?: User | null; // Add currentUser as prop
}

export function SkillCard({
  user,
  onLike,
  onClick,
  onViewDetails,
  isExchangeProposed = false, // Default to false
  currentUser: propCurrentUser, // Destructure the prop
}: SkillCardProps) {
  const dispatch = useAppDispatch();
  const [addSkillToFavorite] = useAddSkillToFavoriteMutation();
  const [removeSkillFromFavorite] = useRemoveSkillFromFavoriteMutation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Truncate name if it's too long
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  // Check if any of the user's skills are in the current user's favorites
  const isUserInFavorites = (): boolean => {
    // Ensure currentUser and skills exist
    if (!propCurrentUser || !user.skills) return false;
    
    // Use empty array if favoriteSkills is undefined
    const favoriteSkills = propCurrentUser.favoriteSkills || [];
    
    // Check if any of the user's skills are in the current user's favorites
    return user.skills.some((userSkill: Skill) => 
      favoriteSkills.some((favSkill: Skill) => favSkill.id === userSkill.id)
    );
  };

  // Toggle favorite status for a user (based on their skills)
  const toggleFavorite = async (userId: string) => {
    try {
      // If we have the onLike handler, use it
      if (onLike) {
        // First, perform the API call to update favorite status
        if (user.skills && user.skills.length > 0) {
          const firstSkill = user.skills[0];
          
          // Ensure currentUser.favoriteSkills exists before checking
          const favoriteSkills = propCurrentUser?.favoriteSkills || [];
          const isCurrentlyFavorite = favoriteSkills.some((favSkill: Skill) => favSkill.id === firstSkill.id);
          
          if (isCurrentlyFavorite) {
            // Remove the first skill from favorites
            await removeSkillFromFavorite(firstSkill.id).unwrap();
          } else {
            // Add the first skill to favorites
            await addSkillToFavorite(firstSkill.id).unwrap();
          }
        }
        
        // Then call the onLike handler to trigger a refresh
        onLike(userId);
        return;
      }
      
      // Otherwise, we need to implement the logic here
      // This is a simplified implementation - in a real app, you might want to:
      // 1. Add the user's first skill to favorites if none are favorited
      // 2. Remove all user's skills from favorites if any are favorited
      if (user.skills && user.skills.length > 0) {
        const firstSkill = user.skills[0];
        
        // Ensure currentUser.favoriteSkills exists before checking
        const favoriteSkills = propCurrentUser?.favoriteSkills || [];
        const isCurrentlyFavorite = favoriteSkills.some((favSkill: Skill) => favSkill.id === firstSkill.id);
        
        if (isCurrentlyFavorite) {
          // Remove the first skill from favorites
          await removeSkillFromFavorite(firstSkill.id).unwrap();
        } else {
          // Add the first skill to favorites
          await addSkillToFavorite(firstSkill.id).unwrap();
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite status:', error);
    }
  };

  // Get first few skills for display, with fallback to empty arrays
  const canTeachSkills = user.skills ? user.skills.slice(0, 3) : [];
  const wantsToLearnSkills = user.wantToLearn
    ? user.wantToLearn.slice(0, 3)
    : [];

  // Show "+X" badge if there are more skills
  const canTeachExtraCount = user.skills
    ? user.skills.length - canTeachSkills.length
    : 0;
  const wantsToLearnExtraCount = user.wantToLearn
    ? user.wantToLearn.length - wantsToLearnSkills.length
    : 0;

  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative rounded-[12px] size-full border border-solid border-[#abd27a]">
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
        <Avatar className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[100px]">
          {user.avatar ? (
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="block max-w-none size-full"
            />
          ) : (
            <AvatarFallback className="flex items-center justify-center size-full bg-[#f0f0f0] text-[#253017] text-2xl font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#253017] text-nowrap">
          <h3 className="flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-semibold justify-center relative shrink-0 text-[20px] tracking-[-0.22px]">
            <span className="leading-[24px] text-nowrap whitespace-pre truncate">
              {truncateName(user.name)}
            </span>
          </h3>
          <p className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[12px] tracking-[0.24px]">
            <span className="leading-[16px] text-nowrap whitespace-pre">
              {user.city || 'Город не указан'},{' '}
              {user.birthdate
                ? new Date(user.birthdate).getFullYear()
                : 'Возраст не указан'}{' '}
              года
            </span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute overflow-clip right-0 size-[24px] top-0 hover:bg-transparent"
          aria-label="Добавить в избранное"
          onClick={() => toggleFavorite(user.id)}
        >
          <Heart className={`size-5 ${isUserInFavorites() ? 'fill-red-500 text-red-500' : 'text-[#253017]'}`} />
        </Button>
      </div>

      <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <h4 className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#253017] text-[16px] tracking-[0.32px] w-full">
              <span className="leading-[24px]">Может научить:</span>
            </h4>
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full flex-wrap">
              {canTeachSkills.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-[#f7e7f2] box-border content-stretch flex gap-[4px] items-center justify-center px-[12px] py-[8px] relative rounded-[20px] shrink-0 font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] text-[#253017] text-[12px] text-nowrap tracking-[0.24px] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onViewDetails?.(skill.id)}
                >
                  <span className="leading-[16px] whitespace-pre">
                    {skill.title}
                  </span>
                </Badge>
              ))}
              {canTeachExtraCount > 0 && (
                <Badge className="bg-[#e8ecf7] box-border content-stretch flex gap-[4px] items-center justify-center px-[12px] py-[8px] relative rounded-[20px] shrink-0 font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] text-[#253017] text-[12px] text-nowrap tracking-[0.24px]">
                  <span className="leading-[16px] whitespace-pre">
                    +{canTeachExtraCount}
                  </span>
                </Badge>
              )}
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <h4 className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#253017] text-[16px] tracking-[0.32px] w-full">
              <span className="leading-[24px]">Хочет научиться:</span>
            </h4>
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full flex-wrap">
              {wantsToLearnSkills.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-[#e7f2f6] box-border content-stretch flex gap-[4px] items-center justify-center px-[12px] py-[8px] relative rounded-[20px] shrink-0 font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] text-[#253017] text-[12px] text-nowrap tracking-[0.24px] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onViewDetails?.(skill.id)}
                >
                  <span className="leading-[16px] whitespace-pre">
                    {skill.title}
                  </span>
                </Badge>
              ))}
              {wantsToLearnExtraCount > 0 && (
                <Badge className="bg-[#e9f7e7] box-border content-stretch flex gap-[4px] items-center justify-center px-[12px] py-[8px] relative rounded-[20px] shrink-0 font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] text-[#253017] text-[12px] text-nowrap tracking-[0.24px]">
                  <span className="leading-[16px] whitespace-pre">
                    +{wantsToLearnExtraCount}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          className={`box-border content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 w-full ${
            isExchangeProposed
              ? 'bg-white border border-[#abd27a] text-[#253017] hover:bg-gray-50'
              : 'bg-[#abd27a] text-white hover:bg-[#9bc06a]'
          }`}
          onClick={() => {
            // Always navigate to the first skill when the button is clicked
            if (onViewDetails && user.skills?.length > 0) {
              onViewDetails(user.skills[0].id);
            }
          }}
        >
          {isExchangeProposed && (
            <div className="content-stretch flex items-center justify-center relative shrink-0">
              <Clock className="relative shrink-0 size-[16px] mr-2" />
            </div>
          )}
          <span className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap tracking-[0.32px] whitespace-pre">
            {isExchangeProposed ? 'Обмен предложен' : 'Подробнее'}
          </span>
          {/*<ChevronRight className="relative shrink-0 size-[16px]" />*/}
        </Button>
      </div>
    </div>
  );
}