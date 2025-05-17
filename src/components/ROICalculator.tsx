
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

// Type for the calculator's state
interface CalculatorState {
  adminWaste: {
    annualSalary: number;
    hoursPerWeek: number;
    numberOfMGOs: number;
    impact: number;
  };
  siloedCollaboration: {
    annualSalary: number;
    hoursWasted: number;
    numberOfUsers: number;
    impact: number;
  };
  missedUpgrades: {
    upgradableDonors: number;
    averageGiftSize: number;
    upgradePercentage: number;
    realizationRate: number;
    impact: number;
  };
  donorLapse: {
    lapsedDonors: number;
    averageGift: number;
    numberOfPortfolios: number;
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

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = value;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    if (range === 0) {
      setCount(end);
      return;
    }
    
    const timer = setInterval(() => {
      start += increment;
      setCount(start);
      
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);
    
    return () => {
      clearInterval(timer);
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
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    adminWaste: {
      annualSalary: 75000,
      hoursPerWeek: 5,
      numberOfMGOs: 10,
      impact: 0,
    },
    siloedCollaboration: {
      annualSalary: 75000,
      hoursWasted: 3,
      numberOfUsers: 15,
      impact: 0,
    },
    missedUpgrades: {
      upgradableDonors: 100,
      averageGiftSize: 250,
      upgradePercentage: 15,
      realizationRate: 25,
      impact: 0,
    },
    donorLapse: {
      lapsedDonors: 50,
      averageGift: 200,
      numberOfPortfolios: 30,
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

  const handleInputChange = (
    section: keyof CalculatorState,
    field: string,
    value: string
  ) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    
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
      (calculatorState.adminWaste.annualSalary / 2080) * 
      calculatorState.adminWaste.hoursPerWeek * 
      52 * 
      calculatorState.adminWaste.numberOfMGOs;
    
    // Calculate Siloed Collaboration Impact
    const siloedCollaborationImpact = 
      (calculatorState.siloedCollaboration.annualSalary / 2080) * 
      calculatorState.siloedCollaboration.hoursWasted * 
      52 * 
      calculatorState.siloedCollaboration.numberOfUsers;
    
    // Calculate Missed Upgrades Impact
    const upgradeAmount = calculatorState.missedUpgrades.averageGiftSize * 
      (calculatorState.missedUpgrades.upgradePercentage / 100);
    
    const successfulUpgrades = calculatorState.missedUpgrades.upgradableDonors * 
      (calculatorState.missedUpgrades.realizationRate / 100);
    
    const missedUpgradesImpact = upgradeAmount * successfulUpgrades * 12;
    
    // Calculate Donor Lapse Impact
    const annualValue = calculatorState.donorLapse.averageGift * 12;
    
    const donorLapseImpact = annualValue * calculatorState.donorLapse.lapsedDonors * 
      (calculatorState.donorLapse.numberOfPortfolios / 100);
    
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
  };

  return (
    <div className="max-w-[1000px] max-h-[600px] mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-instil-purple">Instil ROI Calculator</h1>
        <p className="text-gray-600">See how much your organization could save</p>
      </header>
      
      <div className="flex flex-1 gap-6">
        <div className="w-3/5 bg-gray-50 rounded-lg p-4 shadow-sm">
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
                          placeholder="75000"
                          value={calculatorState.adminWaste.annualSalary || ''}
                          onChange={(e) => handleInputChange('adminWaste', 'annualSalary', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek">Hours Per Week Saved</Label>
                      <Input 
                        id="hoursPerWeek"
                        type="number" 
                        placeholder="5"
                        value={calculatorState.adminWaste.hoursPerWeek || ''}
                        onChange={(e) => handleInputChange('adminWaste', 'hoursPerWeek', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfMGOs">Number of MGOs</Label>
                      <Input 
                        id="numberOfMGOs"
                        type="number" 
                        placeholder="10"
                        value={calculatorState.adminWaste.numberOfMGOs || ''}
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
                          value={calculatorState.siloedCollaboration.annualSalary || ''}
                          onChange={(e) => handleInputChange('siloedCollaboration', 'annualSalary', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hoursWasted">Hours Wasted Per Week</Label>
                      <Input 
                        id="hoursWasted"
                        type="number" 
                        placeholder="3"
                        value={calculatorState.siloedCollaboration.hoursWasted || ''}
                        onChange={(e) => handleInputChange('siloedCollaboration', 'hoursWasted', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfUsers">Number of Users</Label>
                      <Input 
                        id="numberOfUsers"
                        type="number" 
                        placeholder="15"
                        value={calculatorState.siloedCollaboration.numberOfUsers || ''}
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
                        placeholder="100"
                        value={calculatorState.missedUpgrades.upgradableDonors || ''}
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
                          placeholder="250"
                          value={calculatorState.missedUpgrades.averageGiftSize || ''}
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
                            placeholder="15"
                            value={calculatorState.missedUpgrades.upgradePercentage || ''}
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
                            placeholder="25"
                            value={calculatorState.missedUpgrades.realizationRate || ''}
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
                        placeholder="50"
                        value={calculatorState.donorLapse.lapsedDonors || ''}
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
                          placeholder="200"
                          value={calculatorState.donorLapse.averageGift || ''}
                          onChange={(e) => handleInputChange('donorLapse', 'averageGift', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfPortfolios">Number of Portfolios (%)</Label>
                      <div className="relative">
                        <Input 
                          id="numberOfPortfolios"
                          type="number" 
                          placeholder="30"
                          value={calculatorState.donorLapse.numberOfPortfolios || ''}
                          onChange={(e) => handleInputChange('donorLapse', 'numberOfPortfolios', e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={calculateImpact}
              className="bg-gradient-to-r from-instil-purple to-purple-800 hover:from-instil-purple hover:to-purple-700 text-white px-8 py-2"
            >
              Calculate ROI
            </Button>
          </div>
        </div>
        
        <div className="w-2/5 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold text-instil-purple">Potential Annual Impact</h2>
            
            {calculatedResults ? (
              <>
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-center text-gray-500">
                <div className="mb-4 text-instil-purple opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-sm">
                  Enter your information and click "Calculate ROI" to see your potential annual impact
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
