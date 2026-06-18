import SectionHeader from "../components/SectionHeader.jsx";

export default function TermsPage() {
  return (
    <main className="pt-[72px]">
      <section className="bg-[var(--color-pink-pale)] py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Legal"
            title="Terms of Service"
            subtitle="The terms and guidelines governing bookings and itineraries with Pinkfoot Travel."
          />
        </div>
      </section>
      <section className="container-page py-20">
        <div className="prose mx-auto max-w-3xl text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg font-semibold text-[var(--color-navy)]">Last Updated: June 18, 2026</p>
          <p>
            By booking a holiday package, custom itinerary, or visiting this website, you agree to comply with and be bound by the following Terms and Conditions of service.
          </p>
          
          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">1. Booking and Payments</h2>
          <p>
            Bookings are only confirmed upon receipt of the initial deposit specified in your itinerary proposal. Complete balances must be paid prior to departure as detailed in the payment policy of your specific package. Failure to clear payment milestones may result in cancellation of reservations.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">2. Cancellations and Refunds</h2>
          <p>
            All cancellations must be requested in writing. Refund amounts depend on the proximity of the cancellation request to the departure date and the specific policies of our airline and hotel partners. Details will be outlined in your custom itinerary sheet.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">3. Itinerary Changes</h2>
          <p>
            While we strive to adhere strictly to planned schedules, Pinkfoot Travel reserves the right to make minor modifications to itineraries due to weather events, local logistics, or other unforeseen disruptions. We will always notify you immediately and arrange comparable alternatives.
          </p>

          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-8">4. Liability</h2>
          <p>
            Pinkfoot acts as a facilitator between travellers and service operators (airlines, transfer companies, hotels). We are not liable for delays, losses, accidents, or injury caused by third-party providers. We strongly recommend obtaining robust travel insurance for your safety.
          </p>
        </div>
      </section>
    </main>
  );
}
