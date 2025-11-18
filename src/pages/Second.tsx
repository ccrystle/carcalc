import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleSelector } from "@/components/VehicleSelector";
import { EmissionsPayment } from "@/components/EmissionsPayment";
import { EditableText } from "@/components/EditableText";
import { DraggableSection } from "@/components/DraggableSection";
import { supabase } from "@/integrations/supabase/client";
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

const Second = () => {
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
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "hero",
    "co2-stat",
    "what-you-can-do",
    "calculator",
    "why-now",
    "final-cta",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdminStatus();
    loadSectionOrder();
  }, []);

  const loadSectionOrder = async () => {
    const { data } = await supabase
      .from("page_content")
      .select("content")
      .eq("key", "second_section_order")
      .single();

    if (data?.content) {
      try {
        const order = JSON.parse(data.content);
        setSectionOrder(order);
      } catch (e) {
        console.error("Failed to parse section order:", e);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);

      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);

      // Save to database
      await supabase
        .from("page_content")
        .upsert({
          key: "second_section_order",
          content: JSON.stringify(newOrder),
        });

      toast({
        title: "Section order updated",
        description: "The page layout has been reordered",
      });
    }
  };

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      const metricTons = sessionStorage.getItem("payment_metric_tons");
      const totalCost = sessionStorage.getItem("payment_total_cost");
      const paymentType = sessionStorage.getItem("payment_type");

      if (metricTons && totalCost && paymentType) {
        sendReceipt(
          parseFloat(metricTons),
          parseFloat(totalCost),
          paymentType
        );
        sessionStorage.removeItem("payment_metric_tons");
        sessionStorage.removeItem("payment_total_cost");
        sessionStorage.removeItem("payment_type");
      }
      
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const sendReceipt = async (metricTons: number, totalCost: number, paymentType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke("send-payment-receipt", {
        body: { metricTons, totalCost, paymentType },
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
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <EditableText
            contentKey="second_hero_title"
            defaultContent="Take Climate Action"
            className="text-5xl sm:text-7xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            as="h1"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="second_hero_secondary_heading"
            defaultContent="Right Now"
            className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-300"
            as="h2"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="second_hero_subtitle"
            defaultContent="Climate chaos is here — bigger storms, record heat, rising costs. And while the federal government is busy rolling back climate protections and cheering on more drilling + coal… you still have power. Like, today."
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            as="p"
            isAdmin={isAdmin}
          />
        </div>
      </section>
    ),
    "co2-stat": (
      <section className="px-4 py-16 bg-gray-950">
        <div className="mx-auto max-w-4xl text-center">
          <div style={{ color: '#4ade80' }}>
            <EditableText
              contentKey="second_co2_stat_number"
              defaultContent="19.6"
              className="text-8xl sm:text-9xl font-black mb-4"
              as="div"
              isAdmin={isAdmin}
            />
          </div>
          <EditableText
            contentKey="second_co2_stat_unit"
            defaultContent="lbs"
            className="text-xl sm:text-2xl text-gray-400 mb-8"
            as="p"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="second_co2_stat_description"
            defaultContent="CO₂ per gallon of gas your car burns."
            className="text-2xl sm:text-3xl font-semibold mb-8 text-white"
            as="p"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="second_co2_stat_action"
            defaultContent="But you can wipe out your car's yearly footprint today.
No EV required. No guilt trip. Just real action."
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto"
            as="p"
            isAdmin={isAdmin}
          />
        </div>
      </section>
    ),
    "what-you-can-do": (
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <EditableText
            contentKey="second_stop_polluting_title"
            defaultContent='Your "Stop Polluting" Button'
            className="text-4xl sm:text-5xl font-bold mb-8 text-center"
            as="h2"
            isAdmin={isAdmin}
          />
          <div className="text-lg sm:text-xl text-gray-300 space-y-4 leading-relaxed">
            <EditableText
              contentKey="second_stop_polluting_p1"
              defaultContent="We retire real emissions permits that fossil-fuel power plants need to operate in the Northeast."
              className=""
              as="p"
              isAdmin={isAdmin}
            />
            <EditableText
              contentKey="second_stop_polluting_p2"
              defaultContent="If you retire a permit, it disappears forever."
              className=""
              as="p"
              isAdmin={isAdmin}
            />
            <EditableText
              contentKey="second_stop_polluting_p3"
              defaultContent="Less supply = less pollution."
              className=""
              as="p"
              isAdmin={isAdmin}
            />
            <EditableText
              contentKey="second_stop_polluting_p4"
              defaultContent="It's basically a giant stop polluting button you get to press."
              className="font-semibold text-white"
              as="p"
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </section>
    ),
    calculator: (
      <section className="px-4 py-16 sm:py-24 bg-gray-950">
        <div className="mx-auto max-w-2xl">
          <EditableText
            contentKey="second_calculator_title"
            defaultContent="Calculate Your Impact"
            className="text-4xl sm:text-5xl font-bold mb-12 text-center"
            as="h2"
            isAdmin={isAdmin}
          />

          <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 mb-8">
            <VehicleSelector
              onVehicleSelect={setSelectedVehicle}
              isAdmin={isAdmin}
            />

            <div className="mt-6">
              <EditableText
                contentKey="second_annual_miles_label"
                defaultContent="Estimated annual miles"
                className="text-white text-base mb-2 block"
                as="div"
                isAdmin={isAdmin}
              />
              <Input
                id="miles"
                type="number"
                value={annualMiles}
                onChange={(e) => setAnnualMiles(e.target.value)}
                placeholder="12000"
                className="bg-gray-900 border-gray-700 text-white text-lg"
              />
            </div>

            <Button
              onClick={calculateEmissions}
              disabled={!selectedVehicle || !annualMiles}
              className="w-full mt-6 h-12 text-lg font-semibold"
              style={{ backgroundColor: '#4ade80', color: '#000' }}
            >
              <EditableText
                contentKey="second_calculate_button"
                defaultContent="Calculate Emissions"
                className="inline"
                as="div"
                isAdmin={isAdmin}
              />
            </Button>
          </div>

          {emissions !== null && selectedVehicle && (
            <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 mb-8">
              <div className="text-center mb-6">
                <EditableText
                  contentKey="second_annual_emissions_label"
                  defaultContent="Annual CO₂ Emissions"
                  className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-2"
                  as="div"
                  isAdmin={isAdmin}
                />
                <div className="text-6xl font-bold mb-2" style={{ color: '#4ade80' }}>
                  {emissions.toFixed(2)}
                </div>
                <EditableText
                  contentKey="second_tons_per_year"
                  defaultContent="tons per year"
                  className="text-xl font-medium text-gray-300"
                  as="div"
                  isAdmin={isAdmin}
                />
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <EditableText
                  contentKey="second_calculation_label"
                  defaultContent="Calculation:"
                  className="text-xs font-medium text-gray-400 mb-3"
                  as="div"
                  isAdmin={isAdmin}
                />
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_gallons_burned_label"
                          defaultContent="Gallons of gas burned:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white font-mono py-1.5">
                        {parseFloat(annualMiles).toLocaleString()} miles ÷ {selectedVehicle.mpgCombined} mpg = {gallonsConsumed.toFixed(0)} gallons
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_pounds_emitted_label"
                          defaultContent="Pounds CO₂ emitted:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white font-mono py-1.5">
                        {gallonsConsumed.toFixed(0)} gallons × 19.6 lbs CO₂ per gallon = {(gallonsConsumed * 19.6).toFixed(0)} lbs
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_tons_emitted_label"
                          defaultContent="Tons CO₂ emitted:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white font-mono py-1.5 font-semibold">
                        {emissions.toFixed(2)} tons CO₂
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        <EditableText
                          contentKey="second_per_mile_label"
                          defaultContent="CO₂ emitted per mile driven:"
                          className="inline"
                          as="div"
                          isAdmin={isAdmin}
                        />
                      </td>
                      <td className="text-white font-mono py-1.5">
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
                    className="text-gray-400 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_fuel_economy_label"
                    defaultContent="Fuel Economy"
                    className="text-gray-400 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white">
                    {selectedVehicle.mpgCombined} MPG
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_annual_miles_result_label"
                    defaultContent="Annual Miles"
                    className="text-gray-400 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white">
                    {parseFloat(annualMiles).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <EditableText
                    contentKey="second_gallons_consumed_label"
                    defaultContent="Gallons Consumed"
                    className="text-gray-400 inline"
                    as="span"
                    isAdmin={isAdmin}
                  />
                  <span className="font-medium text-white">
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

          <EditableText
            contentKey="second_vehicle_data_source"
            defaultContent="Vehicle data from EPA FuelEconomy.gov"
            className="text-sm text-gray-500 text-center mt-6"
            as="p"
            isAdmin={isAdmin}
          />
        </div>
      </section>
    ),
    "why-now": (
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <EditableText
            contentKey="second_why_now_title"
            defaultContent="When Washington Backs Off, You Don't Have To"
            className="text-4xl sm:text-5xl font-bold mb-8 text-center"
            as="h2"
            isAdmin={isAdmin}
          />
          <div className="text-lg sm:text-xl text-gray-300 space-y-4 leading-relaxed text-center">
            <EditableText
              contentKey="second_why_now_p1"
              defaultContent="Climate rules are being dismantled. But state-level permit systems still work — and you can use them."
              className=""
              as="p"
              isAdmin={isAdmin}
            />
            <EditableText
              contentKey="second_why_now_p2"
              defaultContent="Retire permits. Cut pollution.
Take control while others look away."
              className="font-semibold text-white"
              as="p"
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </section>
    ),
    "final-cta": (
      <section className="px-4 py-16 sm:py-24 bg-gray-950">
        <div className="mx-auto max-w-2xl text-center">
          <EditableText
            contentKey="second_final_cta_title"
            defaultContent="Neutralize Your Footprint Today"
            className="text-4xl sm:text-5xl font-bold mb-8"
            as="h2"
            isAdmin={isAdmin}
          />
          <Button
            onClick={() => {
              const calculatorSection = document.querySelector('section:nth-of-type(4)');
              calculatorSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="h-14 px-12 text-xl font-bold"
            style={{ backgroundColor: '#4ade80', color: '#000' }}
          >
            <EditableText
              contentKey="second_final_cta_button"
              defaultContent="Neutralize My Emissions →"
              className="inline"
              as="div"
              isAdmin={isAdmin}
            />
          </Button>
        </div>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className={isAdmin ? "pl-12" : ""}>
            {sectionOrder.map((sectionId) => (
              <DraggableSection key={sectionId} id={sectionId} isAdmin={isAdmin}>
                {sections[sectionId]}
              </DraggableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Second;
