
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

// Animated counter component with gradual slowdown
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 2000 }) => {
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
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
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
      annualSalary: 125000,
      hoursPerWeek: 15,
      numberOfMGOs: 4,
      impact: 0,
    },
    siloedCollaboration: {
      annualSalary: 75000,
      hoursWasted: 5,
      numberOfUsers: 2,
      impact: 0,
    },
    missedUpgrades: {
      upgradableDonors: 65,
      averageGiftSize: 10000,
      upgradePercentage: 50,
      realizationRate: 50,
      impact: 0,
    },
    donorLapse: {
      lapsedDonors: 15,
      averageGift: 10000,
      numberOfPortfolios: 2,
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

  // Chart data
  const chartData = React.useMemo(() => {
    return [
      {
        name: 'Manual Admin Waste',
        value: calculatorState.adminWaste.impact,
        color: '#6A1B9A' // Deep purple
      },
      {
        name: 'Siloed Collaboration',
        value: calculatorState.siloedCollaboration.impact,
        color: '#8E24AA' // Medium purple
      },
      {
        name: 'Missed Upgrades',
        value: calculatorState.missedUpgrades.impact,
        color: '#AB47BC' // Light purple
      },
      {
        name: 'Donor Lapse',
        value: calculatorState.donorLapse.impact,
        color: '#42F2F7' // Aqua
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
    const numValue = value === '' ? '' : parseFloat(value);
    
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
    const upgradeAmount = Number(calculatorState.missedUpgrades.averageGiftSize) * 
      (Number(calculatorState.missedUpgrades.upgradePercentage) / 100);
    
    const successfulUpgrades = Number(calculatorState.missedUpgrades.upgradableDonors) * 
      (Number(calculatorState.missedUpgrades.realizationRate) / 100);
    
    const missedUpgradesImpact = upgradeAmount * successfulUpgrades * 12;
    
    // Calculate Donor Lapse Impact
    const annualValue = Number(calculatorState.donorLapse.averageGift) * 12;
    
    const donorLapseImpact = annualValue * Number(calculatorState.donorLapse.lapsedDonors) * 
      (Number(calculatorState.donorLapse.numberOfPortfolios) / 100);
    
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

  // Animation classes for results section
  const resultsAnimationClass = showResults
    ? "w-2/5 transition-all duration-500 ease-in-out"
    : "w-0 opacity-0 transition-all duration-500 ease-in-out";

  // Animation class for calculator section
  const calculatorAnimationClass = showResults
    ? "w-3/5 transition-all duration-500 ease-in-out"
    : "w-full transition-all duration-500 ease-in-out";

  return (
    <div className="max-w-[1000px] max-h-[600px] mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-instil-purple">Instil ROI Calculator</h1>
        <p className="text-gray-600">See how much your organization could save</p>
      </header>
      
      <div className="flex flex-1 gap-6">
        <div className={`${calculatorAnimationClass} bg-gray-50 rounded-lg p-4 shadow-sm`}>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
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
                          type="number" 
                          className="pl-8"
                          placeholder="125000"
                          value={calculatorState.adminWaste.annualSalary === '' ? '' : calculatorState.adminWaste.annualSalary}
                          onChange={(e) => handleInputChange('adminWaste', 'annualSalary', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek">Hours Per Week Saved</Label>
                      <Input 
                        id="hoursPerWeek"
                        type="number" 
                        placeholder="15"
                        value={calculatorState.adminWaste.hoursPerWeek === '' ? '' : calculatorState.adminWaste.hoursPerWeek}
                        onChange={(e) => handleInputChange('adminWaste', 'hoursPerWeek', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfMGOs">Number of MGOs</Label>
                      <Input 
                        id="numberOfMGOs"
                        type="number" 
                        placeholder="4"
                        value={calculatorState.adminWaste.numberOfMGOs === '' ? '' : calculatorState.adminWaste.numberOfMGOs}
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
                          type="number" 
                          className="pl-8"
                          placeholder="75000"
                          value={calculatorState.siloedCollaboration.annualSalary === '' ? '' : calculatorState.siloedCollaboration.annualSalary}
                          onChange={(e) => handleInputChange('siloedCollaboration', 'annualSalary', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hoursWasted">Hours Wasted Per Week</Label>
                      <Input 
                        id="hoursWasted"
                        type="number" 
                        placeholder="5"
                        value={calculatorState.siloedCollaboration.hoursWasted === '' ? '' : calculatorState.siloedCollaboration.hoursWasted}
                        onChange={(e) => handleInputChange('siloedCollaboration', 'hoursWasted', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfUsers">Number of Users</Label>
                      <Input 
                        id="numberOfUsers"
                        type="number" 
                        placeholder="2"
                        value={calculatorState.siloedCollaboration.numberOfUsers === '' ? '' : calculatorState.siloedCollaboration.numberOfUsers}
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
                        type="number" 
                        placeholder="65"
                        value={calculatorState.missedUpgrades.upgradableDonors === '' ? '' : calculatorState.missedUpgrades.upgradableDonors}
                        onChange={(e) => handleInputChange('missedUpgrades', 'upgradableDonors', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="averageGiftSize">Average Gift Size</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          id="averageGiftSize"
                          type="number" 
                          className="pl-8"
                          placeholder="10000"
                          value={calculatorState.missedUpgrades.averageGiftSize === '' ? '' : calculatorState.missedUpgrades.averageGiftSize}
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
                            type="number" 
                            placeholder="50"
                            value={calculatorState.missedUpgrades.upgradePercentage === '' ? '' : calculatorState.missedUpgrades.upgradePercentage}
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
                            type="number" 
                            placeholder="50"
                            value={calculatorState.missedUpgrades.realizationRate === '' ? '' : calculatorState.missedUpgrades.realizationRate}
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
                        type="number" 
                        placeholder="15"
                        value={calculatorState.donorLapse.lapsedDonors === '' ? '' : calculatorState.donorLapse.lapsedDonors}
                        onChange={(e) => handleInputChange('donorLapse', 'lapsedDonors', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="donorAverageGift">Average Gift</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          id="donorAverageGift"
                          type="number" 
                          className="pl-8"
                          placeholder="10000"
                          value={calculatorState.donorLapse.averageGift === '' ? '' : calculatorState.donorLapse.averageGift}
                          onChange={(e) => handleInputChange('donorLapse', 'averageGift', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfPortfolios">Number of Portfolios</Label>
                      <Input 
                        id="numberOfPortfolios"
                        type="number" 
                        placeholder="2"
                        value={calculatorState.donorLapse.numberOfPortfolios === '' ? '' : calculatorState.donorLapse.numberOfPortfolios}
                        onChange={(e) => handleInputChange('donorLapse', 'numberOfPortfolios', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="mt-6 flex justify-center">
            {allSectionsCompleted ? (
              <Button 
                onClick={calculateImpact}
                className="bg-gradient-to-r from-instil-purple to-purple-800 hover:from-instil-purple hover:to-purple-700 text-white px-8 py-2"
              >
                Calculate ROI
              </Button>
            ) : (
              <Button 
                onClick={handleNextClick}
                className="bg-gradient-to-r from-instil-purple to-purple-800 hover:from-instil-purple hover:to-purple-700 text-white px-8 py-2"
              >
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
        
        {showResults && (
          <div className={`${resultsAnimationClass} bg-white rounded-lg border border-gray-100 shadow-sm p-4 overflow-hidden`}>
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-instil-purple">Potential Annual Impact</h2>
              
              <div className="text-center my-6">
                <div className="text-3xl font-bold text-instil-purple">
                  <AnimatedCounter value={totalImpact} />
                </div>
                <p className="text-sm text-gray-600 mt-1">Estimated Annual Value</p>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="text-md font-medium mb-2">Impact Breakdown</h3>
                
                <div className="flex-1" style={{ minHeight: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
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
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <div className="text-xs">
                        <div>{entry.name}</div>
                        <div className="font-medium">{formatCurrency(entry.value)}</div>
                      </div>
                    </div>
                  ))}
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
