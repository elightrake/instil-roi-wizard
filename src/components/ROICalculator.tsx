
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { ChevronRight } from "lucide-react";

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
        <p className="font-medium text-gray-900 truncate">{payload[0].name}</p>
        <p className="text-instil-purple font-semibold">{formatCurrency(payload[0].value as number)}</p>
      </div>
    );
  }
  return null;
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
    <div className="max-w-[1000px] mx-auto bg-white rounded-lg shadow-lg p-3 md:p-6 flex flex-col max-h-full md:max-h-[600px] overflow-auto">
      <header className="text-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-instil-purple">Instil ROI Calculator</h1>
        <p className="text-gray-600 text-sm md:text-base">See how much your organization could save</p>
      </header>
      
      <div className={`flex flex-col md:flex-row flex-1 ${isMobile ? 'gap-4' : 'gap-6'}`}>
        <div className={`${calculatorAnimationClass} bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm`}>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
            {/* Mobile tabs with proper background */}
            {isMobile ? (
              <div className="w-full bg-instil-light rounded-md p-1 mb-6">
                {/* Instead of custom div structure, use TabsList for both rows to maintain proper structure */}
                <TabsList className="flex w-full mb-1 bg-transparent">
                  <TabsTrigger 
                    value="adminWaste" 
                    className="flex-1 text-xs data-[state=active]:bg-instil-purple data-[state=active]:text-white"
                  >
                    Admin Waste
                  </TabsTrigger>
                  <TabsTrigger 
                    value="siloedCollaboration" 
                    className="flex-1 text-xs data-[state=active]:bg-instil-purple data-[state=active]:text-white"
                  >
                    Siloed Collab
                  </TabsTrigger>
                </TabsList>
                <TabsList className="flex w-full bg-transparent">
                  <TabsTrigger 
                    value="missedUpgrades" 
                    className="flex-1 text-xs data-[state=active]:bg-instil-purple data-[state=active]:text-white"
                  >
                    Missed Upgrades
                  </TabsTrigger>
                  <TabsTrigger 
                    value="donorLapse" 
                    className="flex-1 text-xs data-[state=active]:bg-instil-purple data-[state=active]:text-white"
                  >
                    Donor Lapse
                  </TabsTrigger>
                </TabsList>
              </div>
            ) : (
              <TabsList className="grid grid-cols-4 mb-4 bg-instil-light">
                <TabsTrigger value="adminWaste" className="data-[state=active]:bg-instil-purple data-[state=active]:text-white">
                  Admin Waste
                </TabsTrigger>
                <TabsTrigger value="siloedCollaboration" className="data-[state=active]:bg-instil-purple data-[state=active]:text-white">
                  Siloed Collab
                </TabsTrigger>
                <TabsTrigger value="missedUpgrades" className="data-[state=active]:bg-instil-purple data-[state=active]:text-white">
                  Missed Upgrades
                </TabsTrigger>
                <TabsTrigger value="donorLapse" className="data-[state=active]:bg-instil-purple data-[state=active]:text-white">
                  Donor Lapse
                </TabsTrigger>
              </TabsList>
            )}
            
            <div className="pt-2">
              <TabsContent value="adminWaste" className="mt-0">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualSalary">Annual Salary</Label>
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
                      <Label htmlFor="hoursPerWeek">Hours Per Week Saved</Label>
                      <Input 
                        id="hoursPerWeek"
                        type="text" 
                        placeholder="15"
                        value={calculatorState.adminWaste.hoursPerWeek === '' ? '' : formatNumber(calculatorState.adminWaste.hoursPerWeek)}
                        onChange={(e) => handleInputChange('adminWaste', 'hoursPerWeek', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfMGOs">Number of MGOs</Label>
                      <Input 
                        id="numberOfMGOs"
                        type="text" 
                        placeholder="4"
                        value={calculatorState.adminWaste.numberOfMGOs === '' ? '' : formatNumber(calculatorState.adminWaste.numberOfMGOs)}
                        onChange={(e) => handleInputChange('adminWaste', 'numberOfMGOs', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="siloedCollaboration" className="mt-0">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scAnnualSalary">Annual Salary</Label>
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
                      <Label htmlFor="hoursWasted">Hours Wasted Per Week</Label>
                      <Input 
                        id="hoursWasted"
                        type="text" 
                        placeholder="5"
                        value={calculatorState.siloedCollaboration.hoursWasted === '' ? '' : formatNumber(calculatorState.siloedCollaboration.hoursWasted)}
                        onChange={(e) => handleInputChange('siloedCollaboration', 'hoursWasted', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfUsers">Number of Users</Label>
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
                      <Label htmlFor="upgradableDonors">Number of Upgradable Donors</Label>
                      <Input 
                        id="upgradableDonors"
                        type="text" 
                        placeholder="65"
                        value={calculatorState.missedUpgrades.upgradableDonors === '' ? '' : formatNumber(calculatorState.missedUpgrades.upgradableDonors)}
                        onChange={(e) => handleInputChange('missedUpgrades', 'upgradableDonors', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="averageGiftSize">Average Gift Size</Label>
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
                        <Label htmlFor="upgradePercentage">Upgrade %</Label>
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
                        <Label htmlFor="realizationRate">Realization Rate %</Label>
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
                      <Label htmlFor="lapsedDonors">Number of Lapsed Donors</Label>
                      <Input 
                        id="lapsedDonors"
                        type="text" 
                        placeholder="15"
                        value={calculatorState.donorLapse.lapsedDonors === '' ? '' : formatNumber(calculatorState.donorLapse.lapsedDonors)}
                        onChange={(e) => handleInputChange('donorLapse', 'lapsedDonors', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="donorAverageGift">Average Gift</Label>
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
                      <Label htmlFor="numberOfPortfolios">Number of Portfolios</Label>
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
              {/* Impact Breakdown - Expanded with more vertical space */}
              <div className="flex-grow space-y-3">
                {/* Wasted Annual Salary Spend Section */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold mb-2">Wasted Annual Salary Spend</h3>
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
                
                {/* Add more spacing here between the sections */}
                <div className="my-6"></div>
                
                {/* Opportunity Cost Section */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold mb-2">Opportunity Cost</h3>
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
              <div className={`flex ${isMobile ? 'flex-col items-center' : 'flex-row items-center'} gap-2 pt-2 border-t mt-auto`}>
                <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-instil-purple">
                      <AnimatedCounter value={totalImpact} />
                    </div>
                    <p className="text-xs text-gray-600">Potential Annual Impact</p>
                  </div>
                </div>
                
                <div className={`${isMobile ? 'w-full h-[120px]' : 'flex-1 h-[90px]'}`}>
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
                      <Tooltip content={<CustomTooltip />} />
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
