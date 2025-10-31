"use client";

import { DirectionAwareHover } from "./DirectionAwareHover";

interface TeamMember {
  id: string;
  name: string;
  photoUrl: string;
  role: string;
}

export const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  // Use a mock image for now
  const mockImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop";

  return (
    <DirectionAwareHover
      imageUrl={mockImage}
      className="w-64 h-80 md:w-72 md:h-96"
      imageClassName="object-cover"
      childrenClassName="text-white"
    >
      <div className="space-y-2">
        <p className="font-bold text-xl">{member.name}</p>
        <p className="text-sm font-medium text-blue-200">{member.role}</p>
        <p className="text-xs text-gray-300">{member.id}</p>
      </div>
    </DirectionAwareHover>
  );
};
