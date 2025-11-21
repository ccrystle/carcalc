import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleSelector } from "@/components/VehicleSelector";
import { EmissionsResult } from "@/components/EmissionsResult";
import { EmissionsPayment } from "@/components/EmissionsPayment";
import { EditableText } from "@/components/EditableText";
import { Leaf } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSection } from "@/components/SortableSection";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<{
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  } | null>(null);
  const [annualMiles, setAnnualMiles] = useState("12000");
  const [emissions, setEmissions] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [sectionOrder, setSectionOrder] = useState([
    "statsRow",
    "heroRow",
    "howItWorksRow",
    "offsetRow",
    "whyNowRow",
    "ctaRow",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  useEffect(() => {
    // Admin check disabled during migration - enabling for demo
    setIsAdmin(true);
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      const metricTons = sessionStorage.getItem("payment_metric_tons");
      const totalCost = sessionStorage.getItem("payment_total_cost");
      const paymentType = sessionStorage.getItem("payment_type");
      const email = sessionStorage.getItem("payment_email");

      if (metricTons && totalCost && paymentType && email) {
        sendReceipt(
          parseFloat(metricTons),
          parseFloat(totalCost),
          paymentType,
          email
        );
        sessionStorage.removeItem("payment_metric_tons");
        sessionStorage.removeItem("payment_total_cost");
        sessionStorage.removeItem("payment_type");
        sessionStorage.removeItem("payment_email");
      }

      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const sendReceipt = async (metricTons: number, totalCost: number, paymentType: string, email: string) => {
    try {
      await api.post('/payment/receipt', {
        metricTons,
        totalCost,
        paymentType,
        email
      });

      toast({
        title: "Receipt Sent!",
        description: "A confirmation email has been sent to your inbox.",
      });
    } catch (error) {
      console.error("Error sending receipt:", error);
    }
  };

  const calculateEmissions = () => {
    if (selectedVehicle && annualMiles) {
      const miles = parseFloat(annualMiles);
      const gallonsConsumed = miles / selectedVehicle.mpgCombined;
      const lbsCO2 = gallonsConsumed * 19.6;
      const tonsCO2 = lbsCO2 / 2000;
      setEmissions(tonsCO2);
    }
  };

  const gallonsConsumed = selectedVehicle && annualMiles
    ? parseFloat(annualMiles) / selectedVehicle.mpgCombined
    : 0;

  const sections: Record<string, JSX.Element> = {
    hero: (
      <section className="px-4 py-8 sm:py-12 lg:py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Mobile-first: Stack everything, side-by-side on lg */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">

            {/* Left Column - Messaging */}
            <div className="w-full text-center lg:text-left order-2 lg:order-1">
              <EditableText
                contentKey="second_hero_title"
                defaultContent="Stop Your Car's Pollution"
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-gray-100 to-green-400 bg-clip-text text-transparent leading-tight"
                as="h1"
                isAdmin={isAdmin}
              />
              <EditableText
                contentKey="second_hero_secondary_heading"
                defaultContent="Today"
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 sm:mb-6 text-green-400"
                as="h2"
                isAdmin={isAdmin}
              />
              <EditableText
                contentKey="second_hero_subtitle"
                defaultContent="Climate chaos is here — bigger storms, record heat, rising costs. While others debate, you can act. Erase your car's carbon footprint. Right here. Right now."
                className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6 sm:mb-8"
                as="p"
                isAdmin={isAdmin}
              />

              {/* Visual: Car emissions - hide on mobile to save space */}
              <div className="hidden sm:flex justify-center lg:justify-start items-center gap-4 mb-6">
                <img
                  src="/images/car_emissions_smoke_1763583695554.png"
                  alt="Car emissions"
                  className="w-24 h-24 lg:w-32 lg:h-32 object-contain opacity-80"
                />
              </div>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-base sm:text-lg"
              >
                <span>How It Works</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Right Column - Calculator - Show first on mobile */}
            <div className="w-full bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-2xl order-1 lg:order-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Calculate Your Impact</h3>
              </div>

              <VehicleSelector
                onVehicleSelect={setSelectedVehicle}
                isAdmin={isAdmin}
              />

              <div className="mt-5 sm:mt-6">
                <Label htmlFor="miles" className="text-gray-200 text-sm sm:text-base mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Annual Miles Driven
                </Label>
                <Input
                  id="miles"
                  type="number"
                  value={annualMiles}
                  onChange={(e) => setAnnualMiles(e.target.value)}
                  placeholder="12000"
                  className="bg-gray-800 border-gray-600 text-white text-base sm:text-lg h-12 sm:h-14"
                />
              </div>

              <Button
                onClick={calculateEmissions}
                disabled={!selectedVehicle || !annualMiles}
                className="w-full mt-5 sm:mt-6 h-12 sm:h-14 text-base sm:text-lg font-bold bg-green-500 hover:bg-green-400 text-black transition-all active:scale-95 shadow-lg shadow-green-500/50"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Show Me My Footprint
              </Button>

              {emissions !== null && selectedVehicle && (
                <div className="mt-5 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-green-400 mb-2">
                      Your Annual Impact
                    </p>
                    <div className="flex items-baseline justify-center gap-2 sm:gap-3 mb-2">
                      <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                        {emissions.toFixed(1)}
                      </span>
                      <span className="text-xl sm:text-2xl font-semibold text-gray-300">
                        tons CO₂
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                      That's {gallonsConsumed.toFixed(0)} gallons of gas per year
                    </p>
                    <Button
                      onClick={() => {
                        const calculatorSection = document.getElementById('offset-options');
                        calculatorSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full h-11 sm:h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-sm sm:text-base active:scale-95"
                    >
                      Offset My Emissions Now →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    ),
    "co2-stat": (
      <section className="px-4 py-12 sm:py-16 lg:py-20 xl:py-32 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
        {/* Background visual */}
        <div className="absolute inset-0 opacity-5">
          <img
            src="/images/co2_cloud_icon_1763583701729.png"
            alt="CO2 background"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] object-contain"
          />
        </div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          {/* Huge number with animation-ready styling - responsive sizing */}
          <div className="mb-4 sm:mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl"></div>
            <div className="relative">
              <div className="inline-flex items-baseline gap-2 sm:gap-3 lg:gap-4">
                {/* Mobile: 8rem, Tablet: 12rem, Desktop: 16rem, XL: 20rem */}
                <span className="text-[8rem] sm:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 drop-shadow-2xl">
                  19.6
                </span>
                <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-400 pb-4 sm:pb-6 lg:pb-8">lbs</span>
              </div>
            </div>
          </div>

          {/* Icon grid for visual interest - hide on mobile to save space */}
          <div className="hidden sm:flex justify-center items-center gap-4 lg:gap-6 mb-6 lg:mb-8 opacity-60">
            <svg className="w-8 h-8 lg:w-12 lg:h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5zm0 18c-4.4-1.2-7-5.6-7-10V8.3l7-3.9 7 3.9V10c0 4.4-2.6 8.8-7 10z" />
              <path d="M12 6L7 9v6c0 3.3 2.2 6.4 5 7.2 2.8-.8 5-3.9 5-7.2V9l-5-3z" />
            </svg>
            <svg className="w-7 h-7 lg:w-10 lg:h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
            </svg>
            <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>

          <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            of CO₂ per gallon
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-4">
            Every gallon. Every mile. Every day.
          </p>

          <div className="max-w-3xl mx-auto px-4">
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400 mb-3 sm:mb-4">
              Make it å--you can make your car carbon neutral. Right here, right now.
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400">
              No EV required. No guilt trip. Just real action.
            </p>
          </div>
        </div>
      </section>
    ),
    "what-you-can-do": (
      <section id="how-it-works" className="px-4 py-12 sm:py-16 lg:py-24 bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-center">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">We Buy Permits</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed px-2">
                We buy real emissions permits that power plants need to pollute.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">Retire Forever</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed px-2">
                When you retire a permit, it's gone forever. Less permits = less pollution.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">It's Real</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed px-2">
                It's legal. It's permanent. It's verifiable. It's making real change.
              </p>
            </div>
          </div>
        </div>
      </section>
    ),
    "offset-options": (
      <section id="offset-options" className="px-4 py-16 sm:py-24 bg-black">
        <div className="mx-auto max-w-2xl">
          {emissions !== null && selectedVehicle && (
            <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 mb-8">
              <div className="text-center mb-6">
                <EditableText
                  contentKey="second_annual_emissions_label"
                  defaultContent={`Annual CO₂ Emissions of your ${selectedVehicle.make} ${selectedVehicle.model}`}
                  className="text-sm font-medium uppercase tracking-wide text-white opacity-100 mb-2"
                  as="div"
                  isAdmin={isAdmin}
                />
                <div className="text-6xl font-bold mb-2 text-white opacity-100">
                  {emissions.toFixed(2)}
                </div>
                <EditableText
                  contentKey="second_tons_per_year"
                  defaultContent="tons per year"
                  className="text-xl font-medium text-white opacity-100"
                  as="div"
                  isAdmin={isAdmin}
                />
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <EditableText
                  contentKey="second_calculation_label"
                  defaultContent="Calculation:"
                  className="text-xs font-medium text-white opacity-100 mb-3"
                  as="div"
                  isAdmin={isAdmin}
                />
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-right text-white opacity-100 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_gallons_burned_label"
                          defaultContent="Gallons of gas burned:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white opacity-100 font-mono py-1.5">
                        {parseFloat(annualMiles).toLocaleString()} miles ÷ {selectedVehicle.mpgCombined} mpg = {gallonsConsumed.toFixed(0)} gallons
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-white opacity-100 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_pounds_emitted_label"
                          defaultContent="Pounds CO₂ emitted:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white opacity-100 font-mono py-1.5">
                        {gallonsConsumed.toFixed(0)} gallons × 19.6 lbs CO₂ per gallon = {(gallonsConsumed * 19.6).toFixed(0)} lbs
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-white opacity-100 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_tons_emitted_label"
                          defaultContent="Tons CO₂ emitted:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white opacity-100 font-mono py-1.5 font-semibold">
                        {emissions.toFixed(2)} tons CO₂
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-white opacity-100 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_per_mile_label"
                          defaultContent="CO₂ emitted per mile driven:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white opacity-100 font-mono py-1.5">
                        {((gallonsConsumed * 19.6) / parseFloat(annualMiles)).toFixed(3)} lbs CO₂/mile
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_vehicle_label"
                    defaultContent="Vehicle"
                    className="text-white opacity-100 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white opacity-100">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_fuel_economy_label"
                    defaultContent="Fuel Economy"
                    className="text-white opacity-100 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white opacity-100">
                    {selectedVehicle.mpgCombined} MPG
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_annual_miles_result_label"
                    defaultContent="Annual Miles"
                    className="text-white opacity-100 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white opacity-100">
                    {parseFloat(annualMiles).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_gallons_consumed_label"
                    defaultContent="Gallons Consumed"
                    className="text-white opacity-100 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white opacity-100">
                    {gallonsConsumed.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {emissions !== null && selectedVehicle && (
            <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8">
              <EmissionsPayment
                emissions={emissions}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {!emissions && (
            <div className="text-center py-12">
              <EditableText
                contentKey="calculator_cta_title"
                defaultContent="Ready to Make a Difference?"
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                as="h3"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
              <EditableText
                contentKey="calculator_cta_description"
                defaultContent="Calculate your car's carbon footprint and offset it today."
                className="text-lg sm:text-xl text-gray-300 mb-8"
                as="p"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
              <Button
                onClick={() => {
                  const calculatorSection = document.querySelector('.order-1.lg\\:order-2');
                  calculatorSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="h-14 px-8 text-lg font-bold bg-green-500 hover:bg-green-400 text-black transition-all active:scale-95 shadow-lg shadow-green-500/50"
              >
                Calculate Your Impact →
              </Button>
            </div>
          )}
        </div>
      </section>
    ),
    
  };

  // Card-based row components - easy to rearrange by moving these definitions
  const cardRows = {
     // ROW 2: Stats Card
    statsRow: (
      <Card className="border-0 bg-gradient-to-b from-black to-gray-950 rounded-none shadow-inner">
        <div className="px-4 py-12 sm:py-16 lg:py-20 xl:py-32 relative overflow-hidden">
          <div className="mx-auto max-w-5xl relative z-10">
            <div className="mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl"></div>
              <div className="relative text-center">
                <div className="mb-6 sm:mb-8 px-4">
                  <EditableText
                    contentKey="stats_pre_title"
                    defaultContent="Crazy fact: Every gallon of gas you burn emits"
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                    as="p"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                </div>
                <div className="flex justify-center items-baseline gap-2 sm:gap-3 lg:gap-4 flex-wrap">
                  <EditableText
                    contentKey="stats_number"
                    defaultContent="19.6"
                    className="text-[4rem] sm:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 drop-shadow-2xl"
                    as="span"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                  <EditableText
                    contentKey="stats_unit"
                    defaultContent="lbs"
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-400 pb-4 sm:pb-6 lg:pb-8"
                    as="span"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                </div>
              </div>
            </div>

            <div className="hidden sm:flex justify-center items-center gap-4 lg:gap-6 mb-6 lg:mb-8 opacity-60">
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5zm0 18c-4.4-1.2-7-5.6-7-10V8.3l7-3.9 7 3.9V10c0 4.4-2.6 8.8-7 10z" />
                <path d="M12 6L7 9v6c0 3.3 2.2 6.4 5 7.2 2.8-.8 5-3.9 5-7.2V9l-5-3z" />
              </svg>
              <svg className="w-7 h-7 lg:w-10 lg:h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
              </svg>
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>

            <div className="text-center mb-4 sm:mb-6">
              <EditableText
                contentKey="stats_description_1"
                defaultContent="of CO₂ per gallon"
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight"
                as="p"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
            </div>
            <div className="text-center mb-6 sm:mb-8 px-4">
              <EditableText
                contentKey="stats_description_2"
                defaultContent="Every gallon. Every mile. Every day."
                className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed"
                as="p"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
            </div>

            <div className="max-w-3xl mx-auto px-4 text-center">
              <EditableText
                contentKey="stats_cta_title"
                defaultContent="Make it right.
Right here, right now.
Make your car carbon neutral."
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400 mb-3 sm:mb-4"
                as="p"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
              <EditableText
                contentKey="stats_cta_subtitle"
                defaultContent="No EV required. No guilt trip. Just real action."
                className="text-base sm:text-lg lg:text-xl text-gray-400"
                as="p"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
            </div>
          </div>
        </div>
      </Card>
    ),
    // ROW 1: Hero with Calculator
    heroRow: (
      <Card className="border-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-none shadow-2xl">
        <div className="px-4 py-8 sm:py-12 lg:py-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          </div>

          <div className="mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
              {/* Messaging Column */}
              <div className="w-full text-center lg:text-left order-2 lg:order-1">
                <EditableText
                  contentKey="hero_title"
                  defaultContent="Stop Your Car's Pollution"
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-gray-100 to-green-400 bg-clip-text text-transparent leading-tight"
                  as="h1"
                  isAdmin={isAdmin}
                  wrapperClassName="w-auto"
                />
                <EditableText
                  contentKey="hero_subtitle"
                  defaultContent="Today"
                  className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 sm:mb-6 text-green-400"
                  as="h2"
                  isAdmin={isAdmin}
                  wrapperClassName="w-auto"
                />
                <EditableText
                  contentKey="hero_description"
                  defaultContent="Climate chaos is here — bigger storms, record heat, rising costs. While others debate, you can act. Erase your car's carbon footprint. Right here. Right now."
                  className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6 sm:mb-8"
                  as="p"
                  isAdmin={isAdmin}
                  wrapperClassName="w-auto"
                />

                <div className="hidden sm:flex justify-center lg:justify-start items-center gap-4 mb-6">
                  <img
                    src="/images/car_emissions_smoke_1763583695554.png"
                    alt="Car emissions"
                    className="w-24 h-24 lg:w-32 lg:h-32 object-contain opacity-80"
                  />
                </div>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-base sm:text-lg"
                >
                  <span>How It Works</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>

              {/* Calculator Card */}
              <Card className="w-full bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl order-1 lg:order-2">
                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Calculate Your Impact</h3>
                  </div>

                  <VehicleSelector onVehicleSelect={setSelectedVehicle} isAdmin={isAdmin} />

                  <div className="mt-5 sm:mt-6">
                    <Label htmlFor="miles" className="text-white text-sm sm:text-base mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Annual Miles Driven
                    </Label>
                    <Input
                      id="miles"
                      type="number"
                      value={annualMiles}
                      onChange={(e) => setAnnualMiles(e.target.value)}
                      placeholder="12000"
                      className="bg-gray-800 border-gray-600 text-white text-base sm:text-lg h-12 sm:h-14"
                    />
                  </div>

                  <Button
                    onClick={calculateEmissions}
                    disabled={!selectedVehicle || !annualMiles}
                    className="w-full mt-5 sm:mt-6 h-12 sm:h-14 text-base sm:text-lg font-bold bg-green-500 hover:bg-green-400 text-black transition-all active:scale-95 shadow-lg shadow-green-500/50"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Show Me My Footprint
                  </Button>

                  {emissions !== null && selectedVehicle && (
                    <Card className="mt-5 sm:mt-6 bg-gray-900 border-gray-700">
                      <div className="p-4 sm:p-6 text-center">
                        <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-green-400 mb-2">
                          Your Annual Impact
                        </p>
                        <div className="flex items-baseline justify-center gap-2 sm:gap-3 mb-2">
                          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                            {emissions.toFixed(1)}
                          </span>
                          <span className="text-xl sm:text-2xl font-semibold text-white">
                            tons CO₂
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                          That's {gallonsConsumed.toFixed(0)} gallons of gas per year
                        </p>
                        <Button
                          onClick={() => {
                            const section = document.getElementById('offset-options');
                            section?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full h-11 sm:h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-sm sm:text-base active:scale-95"
                        >
                          Offset My Emissions Now →
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    ),

    // ROW 3: How It Works Cards
    howItWorksRow: (
      <Card id="how-it-works" className="border-0 bg-gray-900 rounded-none">
        <div className="px-4 py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8 sm:mb-12">
              <EditableText
                contentKey="how_it_works_title"
                defaultContent="How It Works"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
                as="h2"
                isAdmin={isAdmin}
                wrapperClassName="w-auto"
              />
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <EditableText
                    contentKey="hiw_card1_title"
                    defaultContent="We Buy Permits"
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white"
                    as="h3"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                  <EditableText
                    contentKey="hiw_card1_desc"
                    defaultContent="We buy real emissions permits that power plants need to pollute."
                    className="text-sm sm:text-base text-gray-300 leading-relaxed px-2"
                    as="p"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                </div>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <EditableText
                    contentKey="hiw_card2_title"
                    defaultContent="Retire Forever"
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white"
                    as="h3"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                  <EditableText
                    contentKey="hiw_card2_desc"
                    defaultContent="When you retire a permit, it's gone forever. Less permits = less pollution."
                    className="text-sm sm:text-base text-gray-300 leading-relaxed px-2"
                    as="p"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                </div>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-colors sm:col-span-2 md:col-span-1">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <EditableText
                    contentKey="hiw_card3_title"
                    defaultContent="It's Real"
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white"
                    as="h3"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                  <EditableText
                    contentKey="hiw_card3_desc"
                    defaultContent="It's legal. It's permanent. It's verifiable. It's making real change."
                    className="text-sm sm:text-base text-gray-300 leading-relaxed px-2"
                    as="p"
                    isAdmin={isAdmin}
                    wrapperClassName="w-auto"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    ),

    // ROW 4: Offset Options (Payment)  
    offsetRow: (
      <Card id="offset-options" className="border-0 bg-black rounded-none">
        <div className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            {sections["offset-options"]}
          </div>
        </div>
      </Card>
    ),

    // ROW 5: Why Now Card
    whyNowRow: (
      <Card className="border-0 bg-gray-900 rounded-none">
        <div className="px-4 py-12 sm:py-16 lg:py-24">
        </div>
      </Card>
    ),

   
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            {sectionOrder.map((id) => (
              <SortableSection key={id} id={id}>
                {cardRows[id as keyof typeof cardRows]}
              </SortableSection>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default Index;
