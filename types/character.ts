export type OutfitConfig = {
  top: string;
  bottom: string;
  shoes: string;
  accessory?: string;
  color: string;
};

export type FamilyMember = {
  name: string;
  role: 'mama' | 'papa' | 'oma' | 'opa' | 'sister' | 'brother' | 'aunt' | 'uncle';
};

export type ChildProfile = {
  id: string;
  userId: string;
  name: string;
  age: 2 | 3 | 4 | 5 | 6;
  gender: 'girl' | 'boy' | 'neutral';
  characterSheetId: string;
  signatureOutfit: OutfitConfig;
  companionObject: { name: string; type: string; description: string };
  city: string;
  familyMembers: FamilyMember[];
  createdAt: string;
};

export type CharacterSheet = {
  id: string;
  childProfileId: string;
  referenceImages: {
    front: string;
    threeQuarterLeft: string;
    threeQuarterRight: string;
    walking: string;
    sitting: string;
    withCompanion: string;
  };
  styleLoraId: string;
  version: number;
  createdAt: string;
};
