import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, TooltipProps } from 'recharts';
import { ChevronRight, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type for the calculator's state
interface CalculatorState {
  adminWaste: {
    annualSalary: number | '';
    hoursPerWeek: number | '';
    numberOfMGOs: number | '';
    impact: number;
  };
  siloedCollaboration: {
    annualSalary: number | '';
    hoursWasted: number | '';
    numberOfUsers: number | '';
    impact: number;
  };
  missedUpgrades: {
    upgradableDonors: number | '';
    averageGiftSize: number | '';
    upgradePercentage: number | '';
    realizationRate: number | '';
    impact: number;
  };
  donorLapse: {
    lapsedDonors: number | '';
    averageGift: number | '';
    numberOfPortfolios: number | '';
    impact: number;
  };
}

// Section descriptions for each tab
const sectionDescriptions = {
  adminWaste: "Calculate the cost of time spent on manual administrative tasks that could be automated.",
  siloedCollaboration: "Measure the cost of inefficient collaboration across development teams.",
  missedUpgrades: "Estimate potential revenue from upgrading existing donors to higher gift levels.",
  donorLapse: "Quantify the cost of donor attrition that could be prevented with better management."
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to format number with commas
const formatNumber = (value: number | string): string => {
  if (value === '') return '';
  return new Intl.NumberFormat('en-US').format(Number(value));
};

// Helper function to parse formatted number input
const parseFormattedNumber = (value: string): number | '' => {
  if (value === '') return '';
  // Remove all non-digit characters
  const digitsOnly = value.replace(/[^\d]/g, '');
  return digitsOnly === '' ? '' : Number(digitsOnly);
};

// Animated counter component with gradual slowdown
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    // Easing function to create slowdown effect
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    
    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        // Use easing to slow down as it approaches the target
        const easedProgress = easeOutQuart(progress);
        setCount(Math.floor(easedProgress * value));
        animationFrame = requestAnimationFrame(animateValue);
      } else {
        setCount(value);
      }
    };
    
    animationFrame = requestAnimationFrame(animateValue);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);
  
  return <span className="animate-count-up">{formatCurrency(count)}</span>;
};

// Custom tooltip for the pie chart
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-1 border border-gray-200 rounded shadow-sm text-xs" style={{ maxWidth: '100px' }}>
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-instil-purple font-semibold">{formatCurrency(payload[0].value as number)}</p>
      </div>
    );
  }
  return null;
};

// Field definitions for tooltips
const fieldDefinitions = {
  adminWaste: {
    annualSalary: "The average annual salary of a fundraiser in your organization.",
    hoursPerWeek: "The number of hours per week spent on data entry.",
    numberOfMGOs: "The total number of fundraisers in your organization who would benefit from reduced admin work."
  },
  siloedCollaboration: {
    annualSalary: "The average annual salary of team members involved in collaborative fundraising efforts.",
    hoursWasted: "Hours wasted per week due to siloed information and lack of collaborative tools.",
    numberOfUsers: "Number of team members affected by collaboration inefficiencies."
  },
  missedUpgrades: {
    upgradableDonors: "The number of donors in your database who have the potential for upgrading their gift level.",
    averageGiftSize: "The average donation amount from your typical donor.",
    upgradePercentage: "The percentage of donors you feel you will successfully upgrade.",
    realizationRate: "The percent of extra giving potential from donors that you expect to actually raise."
  },
  donorLapse: {
    lapsedDonors: "The average number of donors who stop giving or become inactive each year in a portfolio.",
    averageGift: "The average gift amount from these at-risk donors.",
    numberOfPortfolios: "The number of donor portfolios in your organization."
  }
};

// Label with tooltip component
const LabelWithTooltip = ({ htmlFor, tooltipText, children }: { htmlFor: string; tooltipText: string; children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="right">
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const ROICalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("adminWaste");
  const [calculatedResults, setCalculatedResults] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    adminWaste: {
      annualSalary: '',
      hoursPerWeek: '',
      numberOfMGOs: '',
      impact: 0,
    },
    siloedCollaboration: {
      annualSalary: '',
      hoursWasted: '',
      numberOfUsers: '',
      impact: 0,
    },
    missedUpgrades: {
      upgradableDonors: '',
      averageGiftSize: '',
      upgradePercentage: '',
      realizationRate: '',
      impact: 0,
    },
    donorLapse: {
      lapsedDonors: '',
      averageGift: '',
      numberOfPortfolios: '',
      impact: 0,
    },
  });

  // Calculate the total impact
  const totalImpact = React.useMemo(() => {
    return (
      calculatorState.adminWaste.impact +
      calculatorState.siloedCollaboration.impact +
      calculatorState.missedUpgrades.impact +
      calculatorState.donorLapse.impact
    );
  }, [calculatorState]);

  // Calculate totals for the two categories
  const wastedAnnualSalarySpend = React.useMemo(() => {
    return calculatorState.adminWaste.impact + calculatorState.siloedCollaboration.impact;
  }, [calculatorState.adminWaste.impact, calculatorState.siloedCollaboration.impact]);

  const opportunityCost = React.useMemo(() => {
    return calculatorState.missedUpgrades.impact + calculatorState.donorLapse.impact;
  }, [calculatorState.missedUpgrades.impact, calculatorState.donorLapse.impact]);

  // Chart data
  const chartData = React.useMemo(() => {
    return [
      {
        name: 'Manual Admin Waste',
        value: calculatorState.adminWaste.impact,
        color: '#6A1B9A', // Deep purple
        category: 'Wasted Annual Salary Spend'
      },
      {
        name: 'Siloed Collaboration',
        value: calculatorState.siloedCollaboration.impact,
        color: '#8E24AA', // Medium purple
        category: 'Wasted Annual Salary Spend'
      },
      {
        name: 'Missed Upgrades',
        value: calculatorState.missedUpgrades.impact,
        color: '#AB47BC', // Light purple
        category: 'Opportunity Cost'
      },
      {
        name: 'Donor Lapse',
        value: calculatorState.donorLapse.impact,
        color: '#42F2F7', // Aqua
        category: 'Opportunity Cost'
      }
    ].filter(item => item.value > 0);
  }, [calculatorState]);

  // Check if a section is complete
  const isSectionComplete = (section: keyof CalculatorState): boolean => {
    const sectionData = calculatorState[section];
    return Object.entries(sectionData)
      .filter(([key]) => key !== 'impact') // Exclude the impact field
      .every(([_, value]) => value !== '');
  };

  // Check if all sections are completed
  const allSectionsCompleted = React.useMemo(() => {
    return (
      isSectionComplete('adminWaste') &&
      isSectionComplete('siloedCollaboration') &&
      isSectionComplete('missedUpgrades') &&
      isSectionComplete('donorLapse')
    );
  }, [calculatorState]);

  // Find the next incomplete section
  const findNextIncompleteSection = (): string => {
    const sections: (keyof CalculatorState)[] = ['adminWaste', 'siloedCollaboration', 'missedUpgrades', 'donorLapse'];
    const currentIndex = sections.indexOf(activeTab as keyof CalculatorState);
    
    // First check after the current tab
    for (let i = currentIndex + 1; i < sections.length; i++) {
      if (!isSectionComplete(sections[i])) {
        return sections[i];
      }
    }
    
    // If not found after current tab, check from the beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!isSectionComplete(sections[i])) {
        return sections[i];
      }
    }
    
    // If all sections complete, return the current tab
    return activeTab;
  };

  const handleInputChange = (
    section: keyof CalculatorState,
    field: string,
    value: string
  ) => {
    const numValue = parseFormattedNumber(value);
    
    setCalculatorState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: numValue,
      },
    }));
  };

  const calculateImpact = () => {
    // Calculate Manual Admin Waste Impact
    const adminWasteImpact = 
      (Number(calculatorState.adminWaste.annualSalary) / 2080) * 
      Number(calculatorState.adminWaste.hoursPerWeek) * 
      52 * 
      Number(calculatorState.adminWaste.numberOfMGOs);
    
    // Calculate Siloed Collaboration Impact
    const siloedCollaborationImpact = 
      (Number(calculatorState.siloedCollaboration.annualSalary) / 2080) * 
      Number(calculatorState.siloedCollaboration.hoursWasted) * 
      52 * 
      Number(calculatorState.siloedCollaboration.numberOfUsers);
    
    // Calculate Missed Upgrades Impact
    const missedUpgradesImpact = 
      Number(calculatorState.missedUpgrades.upgradableDonors) * 
      Number(calculatorState.missedUpgrades.averageGiftSize) * 
      (Number(calculatorState.missedUpgrades.upgradePercentage) / 100) * 
      (Number(calculatorState.missedUpgrades.realizationRate) / 100);
    
    // Calculate Donor Lapse Impact
    const lostDonorValue = Number(calculatorState.donorLapse.lapsedDonors) * 
      Number(calculatorState.donorLapse.averageGift);
    
    const donorLapseImpact = lostDonorValue * Number(calculatorState.donorLapse.numberOfPortfolios);
    
    setCalculatorState((prev) => ({
      ...prev,
      adminWaste: {
        ...prev.adminWaste,
        impact: Math.round(adminWasteImpact),
      },
      siloedCollaboration: {
        ...prev.siloedCollaboration,
        impact: Math.round(siloedCollaborationImpact),
      },
      missedUpgrades: {
        ...prev.missedUpgrades,
        impact: Math.round(missedUpgradesImpact),
      },
      donorLapse: {
        ...prev.donorLapse,
        impact: Math.round(donorLapseImpact),
      },
    }));
    
    setCalculatedResults(true);
    setShowResults(true);
  };

  // Handle Next button click
  const handleNextClick = () => {
    const nextSection = findNextIncompleteSection();
    setActiveTab(nextSection);
  };

  // Check if we're on a mobile device using a media query
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial state based on window width
    setIsMobile(window.innerWidth < 768);

    // Create a media query listener
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // Define handler function
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    // Add the listener
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  // Animation classes - adjusted for mobile
  const resultsAnimationClass = showResults
    ? isMobile 
      ? "w-full mt-6 transition-all duration-500 ease-in-out"
      : "w-2/5 transition-all duration-500 ease-in-out" 
    : "w-0 opacity-0 transition-all duration-500 ease-in-out";

  // Animation class for calculator section - adjusted for mobile
  const calculatorAnimationClass = isMobile 
    ? "w-full transition-all duration-500 ease-in-out"
    : showResults
      ? "w-3/5 transition-all duration-500 ease-in-out"
      : "w-full transition-all duration-500 ease-in-out";

  return (
    <div className="max-w-[1000px] mx-auto bg-instil-dark rounded-lg shadow-lg p-3 md:p-6 flex flex-col max-h-full md:max-h-[600px] overflow-auto">
      
      <div className={`flex flex-col md:flex-row flex-1 ${isMobile ? 'gap-4' : 'gap-6'}`}>
        <div className={`${calculatorAnimationClass} bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm`}>
          <TooltipProvider>
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value)}
              className="w-full"
            >
              {/* Mobile tabs with proper background */}
              {isMobile ? (
                <div className="w-full bg-instil-lightpurple rounded-md p-1 mb-6">
                  {/* Fixed TabsList structure for mobile */}
                  <TabsList className="grid grid-cols-2 w-full mb-1 bg-instil-lightpurple h-auto">
                    <TabsTrigger 
                      value="adminWaste" 
                      className="text-xs px-1 py-2 text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto"
                    >
                      Admin Waste
                    </TabsTrigger>
                    <TabsTrigger 
                      value="siloedCollaboration" 
                      className="text-xs px-1 py-2 text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto"
                    >
                      Isolated Teamwork
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 w-full bg-instil-lightpurple h-auto">
                    <TabsTrigger 
                      value="missedUpgrades" 
                      className="text-xs px-1 py-2 text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto"
                    >
                      Missed Upgrades
                    </TabsTrigger>
                    <TabsTrigger 
                      value="donorLapse" 
                      className="text-xs px-1 py-2 text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto"
                    >
                      Donor Lapse
                    </TabsTrigger>
                  </TabsList>
                </div>
              ) : (
                <TabsList className="grid grid-cols-4 mb-4 bg-instil-lightpurple">
                  <TabsTrigger 
                    value="adminWaste" 
                    className="text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto min-h-[40px]"
                  >
                    Admin Waste
                  </TabsTrigger>
                  <TabsTrigger 
                    value="siloedCollaboration" 
                    className="text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto min-h-[40px]"
                  >
                    Isolated Teamwork
                  </TabsTrigger>
                  <TabsTrigger 
                    value="missedUpgrades" 
                    className="text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto min-h-[40px]"
                  >
                    Missed Upgrades
                  </TabsTrigger>
                  <TabsTrigger 
                    value="donorLapse" 
                    className="text-instil-purple data-[state=active]:bg-instil-purple data-[state=active]:text-white whitespace-normal h-auto min-h-[40px]"
                  >
                    Donor Lapse
                  </TabsTrigger>
                </TabsList>
              )}
              
              {/* Section description - shows only for active tab */}
              <div className="mb-4 text-sm text-gray-600 italic px-1">
                {sectionDescriptions[activeTab as keyof typeof sectionDescriptions]}
              </div>
              
              <div className="pt-2">
                <TabsContent value="adminWaste" className="mt-0">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="numberOfMGOs" 
                          tooltipText={fieldDefinitions.adminWaste.numberOfMGOs}
                        >
                          # of Fundraisers
                        </LabelWithTooltip>
                        <Input 
                          id="numberOfMGOs"
                          type="text" 
                          placeholder="4"
                          value={calculatorState.adminWaste.numberOfMGOs === '' ? '' : formatNumber(calculatorState.adminWaste.numberOfMGOs)}
                          onChange={(e) => handleInputChange('adminWaste', 'numberOfMGOs', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="annualSalary" 
                          tooltipText={fieldDefinitions.adminWaste.annualSalary}
                        >
                          Annual Salary
                        </LabelWithTooltip>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            id="annualSalary"
                            type="text" 
                            className="pl-8"
                            placeholder="125,000"
                            value={calculatorState.adminWaste.annualSalary === '' ? '' : formatNumber(calculatorState.adminWaste.annualSalary)}
                            onChange={(e) => handleInputChange('adminWaste', 'annualSalary', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="hoursPerWeek" 
                          tooltipText={fieldDefinitions.adminWaste.hoursPerWeek}
                        >
                          Hours Spent on Data Entry
                        </LabelWithTooltip>
                        <Input 
                          id="hoursPerWeek"
                          type="text" 
                          placeholder="15"
                          value={calculatorState.adminWaste.hoursPerWeek === '' ? '' : formatNumber(calculatorState.adminWaste.hoursPerWeek)}
                          onChange={(e) => handleInputChange('adminWaste', 'hoursPerWeek', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="siloedCollaboration" className="mt-0">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="scAnnualSalary" 
                          tooltipText={fieldDefinitions.siloedCollaboration.annualSalary}
                        >
                          Annual Salary
                        </LabelWithTooltip>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            id="scAnnualSalary"
                            type="text" 
                            className="pl-8"
                            placeholder="75,000"
                            value={calculatorState.siloedCollaboration.annualSalary === '' ? '' : formatNumber(calculatorState.siloedCollaboration.annualSalary)}
                            onChange={(e) => handleInputChange('siloedCollaboration', 'annualSalary', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="hoursWasted" 
                          tooltipText={fieldDefinitions.siloedCollaboration.hoursWasted}
                        >
                          Hours Wasted Per Week
                        </LabelWithTooltip>
                        <Input 
                          id="hoursWasted"
                          type="text" 
                          placeholder="5"
                          value={calculatorState.siloedCollaboration.hoursWasted === '' ? '' : formatNumber(calculatorState.siloedCollaboration.hoursWasted)}
                          onChange={(e) => handleInputChange('siloedCollaboration', 'hoursWasted', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="numberOfUsers" 
                          tooltipText={fieldDefinitions.siloedCollaboration.numberOfUsers}
                        >
                          Number of Users
                        </LabelWithTooltip>
                        <Input 
                          id="numberOfUsers"
                          type="text" 
                          placeholder="2"
                          value={calculatorState.siloedCollaboration.numberOfUsers === '' ? '' : formatNumber(calculatorState.siloedCollaboration.numberOfUsers)}
                          onChange={(e) => handleInputChange('siloedCollaboration', 'numberOfUsers', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="missedUpgrades" className="mt-0">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="upgradableDonors" 
                          tooltipText={fieldDefinitions.missedUpgrades.upgradableDonors}
                        >
                          # of Donors with Potential to Upgrade
                        </LabelWithTooltip>
                        <Input 
                          id="upgradableDonors"
                          type="text" 
                          placeholder="65"
                          value={calculatorState.missedUpgrades.upgradableDonors === '' ? '' : formatNumber(calculatorState.missedUpgrades.upgradableDonors)}
                          onChange={(e) => handleInputChange('missedUpgrades', 'upgradableDonors', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="averageGiftSize" 
                          tooltipText={fieldDefinitions.missedUpgrades.averageGiftSize}
                        >
                          Average Gift Size
                        </LabelWithTooltip>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            id="averageGiftSize"
                            type="text" 
                            className="pl-8"
                            placeholder="10,000"
                            value={calculatorState.missedUpgrades.averageGiftSize === '' ? '' : formatNumber(calculatorState.missedUpgrades.averageGiftSize)}
                            onChange={(e) => handleInputChange('missedUpgrades', 'averageGiftSize', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <LabelWithTooltip 
                            htmlFor="upgradePercentage" 
                            tooltipText={fieldDefinitions.missedUpgrades.upgradePercentage}
                          >
                            Upgrade %
                          </LabelWithTooltip>
                          <div className="relative">
                            <Input 
                              id="upgradePercentage"
                              type="text" 
                              placeholder="50"
                              value={calculatorState.missedUpgrades.upgradePercentage === '' ? '' : formatNumber(calculatorState.missedUpgrades.upgradePercentage)}
                              onChange={(e) => handleInputChange('missedUpgrades', 'upgradePercentage', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <LabelWithTooltip 
                            htmlFor="realizationRate" 
                            tooltipText={fieldDefinitions.missedUpgrades.realizationRate}
                          >
                            Realization Rate
                          </LabelWithTooltip>
                          <div className="relative">
                            <Input 
                              id="realizationRate"
                              type="text" 
                              placeholder="50"
                              value={calculatorState.missedUpgrades.realizationRate === '' ? '' : formatNumber(calculatorState.missedUpgrades.realizationRate)}
                              onChange={(e) => handleInputChange('missedUpgrades', 'realizationRate', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="donorLapse" className="mt-0">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="lapsedDonors" 
                          tooltipText={fieldDefinitions.donorLapse.lapsedDonors}
                        >
                          Number of Lapsed Donors
                        </LabelWithTooltip>
                        <Input 
                          id="lapsedDonors"
                          type="text" 
                          placeholder="15"
                          value={calculatorState.donorLapse.lapsedDonors === '' ? '' : formatNumber(calculatorState.donorLapse.lapsedDonors)}
                          onChange={(e) => handleInputChange('donorLapse', 'lapsedDonors', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="donorAverageGift" 
                          tooltipText={fieldDefinitions.donorLapse.averageGift}
                        >
                          Average Gift
                        </LabelWithTooltip>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            id="donorAverageGift"
                            type="text" 
                            className="pl-8"
                            placeholder="10,000"
                            value={calculatorState.donorLapse.averageGift === '' ? '' : formatNumber(calculatorState.donorLapse.averageGift)}
                            onChange={(e) => handleInputChange('donorLapse', 'averageGift', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <LabelWithTooltip 
                          htmlFor="numberOfPortfolios" 
                          tooltipText={fieldDefinitions.donorLapse.numberOfPortfolios}
                        >
                          Number of Portfolios
                        </LabelWithTooltip>
                        <Input 
                          id="numberOfPortfolios"
                          type="text" 
                          placeholder="2"
                          value={calculatorState.donorLapse.numberOfPortfolios === '' ? '' : formatNumber(calculatorState.donorLapse.numberOfPortfolios)}
                          onChange={(e) => handleInputChange('donorLapse', 'numberOfPortfolios', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </TooltipProvider>
          
          <div className="mt-6 flex justify-center">
            {!allSectionsCompleted ? (
              <Button 
                onClick={handleNextClick}
                className="bg-gradient-to-r from-instil-purple to-purple-800 hover:from-instil-purple hover:to-purple-700 text-white px-8 py-2"
              >
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={calculateImpact}
                className="bg-gradient-to-r from-instil-purple to-purple-800 hover:from-instil-purple hover:to-purple-700 text-white px-8 py-2"
              >
                Calculate ROI
              </Button>
            )}
          </div>
        </div>
        
        {showResults && (
          <div className={`${resultsAnimationClass} bg-white rounded-lg border border-gray-100 shadow-sm p-3 md:p-4 overflow-hidden`}>
            <div className="h-full flex flex-col">
              {/* Impact Breakdown - Adjusted for responsive text */}
              <div className="flex-grow space-y-3">
                {/* Wasted Annual Salary Spend Section - Updated with responsive text */}
                <div className="mb-3">
                  <h3 className="text-xs md:text-sm font-semibold mb-2 transition-all duration-300">Wasted Annual Salary Spend</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {chartData
                      .filter(item => item.category === 'Wasted Annual Salary Spend')
                      .map((entry, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <div className="text-xs">
                              {entry.name}
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            {formatCurrency(entry.value)}
                          </div>
                        </div>
                      ))}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                      <div className="text-xs font-medium">Total</div>
                      <div className="text-xs font-semibold">
                        {formatCurrency(wastedAnnualSalarySpend)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Add more spacing between the sections for desktop only */}
                <div className={isMobile ? "my-4" : "my-6"}></div>
                
                {/* Opportunity Cost Section - Updated with responsive text */}
                <div className="mb-3">
                  <h3 className="text-xs md:text-sm font-semibold mb-2 transition-all duration-300">Opportunity Cost</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {chartData
                      .filter(item => item.category === 'Opportunity Cost')
                      .map((entry, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <div className="text-xs">
                              {entry.name}
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            {formatCurrency(entry.value)}
                          </div>
                        </div>
                      ))}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                      <div className="text-xs font-medium">Total</div>
                      <div className="text-xs font-semibold">
                        {formatCurrency(opportunityCost)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total Impact and Chart - Adjusted for mobile */}
              <div className={`flex ${isMobile ? 'flex-col items-center' : 'flex-row items-center'} gap-2 mt-auto`}>
                <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                  <div className="text-center">
                    <div className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-instil-purple transition-all duration-300">
                      <AnimatedCounter value={totalImpact} />
                    </div>
                    <p className="text-xs text-gray-600">Potential Annual Impact</p>
                  </div>
                </div>
                
                {/* Fixed the pie chart container positioning and size */}
                <div className={`${isMobile ? 'w-full h-[120px]' : 'flex-1 h-[90px] max-w-[150px]'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? 50 : 40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROICalculator;
