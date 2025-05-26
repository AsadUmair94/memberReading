import { useEffect, useState } from 'react';
import './App.css';
import ModalWithLoader from './ModalWithLoader/ModalWithLoader';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
function appsixmonth() {
    const [loader, setLoader] = useState(false);
    const [editable, setEditable] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('current');
    const [after_six_month_calculations, setAfter_six_month_calculations] = useState([]);
    const [selectedMember, setSelectedMember] = useState([]);
    const [totalScoreCustom, setTotalScoreCustom] = useState();
    const [selectedMonth, setSelectedMonth] = useState();
    const [activeTabProjections, setActiveTabProjections] = useState('Next Level');
    const [formData, setFormData] = useState({
        projections: "Next Level",
        present: "",
        late: false,
        substitutes: false,
        medical: false,
        rgo: false,
        rgi: false,
        one2ones: false,
        ceus: false,
        visitors: false,
    });




    function getWednesdaysInMonth(monthYear) {
        const [monthStr, yearStr] = monthYear.split("/");
        const month = parseInt(monthStr) - 1; // JavaScript months are 0-based
        const year = parseInt("20" + yearStr); // Convert "25" to 2025

        let count = 0;

        // Loop through all days in the month
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            if (date.getDay() === 3) { // 3 = Wednesday
                count++;
            }
            date.setDate(date.getDate() + 1);
        }

        return count;
    }




    function getWednesdaysInMonth(monthYear) {
        const [monthStr, yearStr] = monthYear.split("/");
        const month = parseInt(monthStr) - 1; // JavaScript months are 0-based
        const year = parseInt("20" + yearStr); // Convert "25" to 2025

        let count = 0;

        // Loop through all days in the month
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            if (date.getDay() === 3) { // 3 = Wednesday
                count++;
            }
            date.setDate(date.getDate() + 1);
        }

        return count;
    }
    const getAttendancePoints = (presents, substitutes, lates, totalMeetings) => {
        // Convert substitutes and lates to equivalent presents (0.5 each)
        const effectivePresents = presents + (substitutes * 0.5) + (lates * 0.5);
        const attendanceRate = totalMeetings > 0 ? effectivePresents / totalMeetings : 0;

        // Apply the new thresholds
        if (attendanceRate >= 0.95) return 20;
        if (attendanceRate >= 0.85) return 15;
        if (attendanceRate >= 0.75) return 10;
        return attendanceRate; // Less than 75%
    };
    const getReferralPoints = (referralsPerWeek) => {
        if (referralsPerWeek >= 1) return 20;
        if (referralsPerWeek >= 0.75) return 15;
        if (referralsPerWeek >= 0.5) return 10;
        if (referralsPerWeek >= 0.25) return 5;
        return 0;
    };

    const getVisitorPoints = (visitorsPerWeek) => {
        if (visitorsPerWeek >= 0.23) return 20;
        if (visitorsPerWeek >= 0.173) return 15;
        if (visitorsPerWeek >= 0.115) return 10;
        if (visitorsPerWeek >= 0.057) return 5;
        return 0;
    };

    const get121Points = (meetingsPerWeek) => {
        if (meetingsPerWeek >= 1) return 20;
        if (meetingsPerWeek >= 0.75) return 15;
        if (meetingsPerWeek >= 0.5) return 10;
        if (meetingsPerWeek >= 0.25) return 5;
        return 0;
    };

    const getCEUPoints = (ceuPerWeek) => {
        if (ceuPerWeek >= 1) return 20;
        if (ceuPerWeek >= 0.75) return 15;
        if (ceuPerWeek >= 0.5) return 10;
        if (ceuPerWeek >= 0.25) return 5;
        return 0;
    };

    const getMonthName = (aa) => {
        console.log(aa)
        const date = new Date(aa);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[date.getMonth()];
    }
    const getNextMonthName = (aa) => {
        const date = new Date(aa);
        const nextMonthIndex = (date.getMonth() + 1) % 12;

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[nextMonthIndex];
    }
    async function getMemberTrendsModal() {
        setModalOpen(false);
        setLoader(false);
        getDataFromN8n();
    }
    async function getMemberTrends() {

        setLoader(true);
        try {
            const res = await fetch('https://roilevelup.app.n8n.cloud/webhook/memberTrends', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                setLoader(false);
                setModalOpen(true);
                throw new Error(`HTTP error! Status: ${res.status}`);

            }

            const data = await res.json();
            const membersArray = Object.entries(data).map(([name, data]) => ({
                member_name: name,
                memberName: name,
                ...data,
            }));


            return membersArray; // return result after fetch is done
        } catch (error) {
            setLoader(false);
            console.error('Error fetching member trends:', error);
            setModalOpen(true);
            return []; // return empty list on error
        }
    }
    const getDataFromN8n = async () => {
        var all_mmbers = await getMemberTrends();
        console.log(all_mmbers);

        setAfter_six_month_calculations(all_mmbers)
        var selectedOne = all_mmbers[0];
        setSelectedMember(selectedOne);
        if (selectedOne.levelName == 'Green') {
            setFormData(prev => ({
                ...prev,
                projections: "Maximum",
                present: selectedOne.improvementsNeeded.toImprove.attendance,
                late: 0,
                substitutes: 0,
                medical: 0,
                rgo: selectedOne.improvementsNeeded.toImprove.referrals,
                rgi: 0,
                one2ones: selectedOne.improvementsNeeded.toImprove.oneToOnes,
                ceus: selectedOne.improvementsNeeded.toImprove.attendance,
                visitors: selectedOne.improvementsNeeded.toImprove.visitors,
            }));
        }
        if (selectedOne.levelName != 'Green') {
            setFormData(prev => ({
                ...prev,
                projections: "Next Level",
                present: selectedOne.improvementsNeeded.toNextLevel.attendance,
                late: 0,
                substitutes: 0,
                medical: 0,
                rgo: selectedOne.improvementsNeeded.toNextLevel.referrals,
                rgi: 0,
                one2ones: selectedOne.improvementsNeeded.toNextLevel.oneToOnes,
                ceus: selectedOne.improvementsNeeded.toNextLevel.attendance,
                visitors: selectedOne.improvementsNeeded.toNextLevel.visitors,
            }));
        }

        setLoader(false);
    }
    const handleChange = async (event) => {
        const value = event.target.value;
        after_six_month_calculations.forEach(element => {
            if (element.memberName == value) {
                setSelectedMember(element);
                console.log(element)

                if (element.levelName == 'Green') {
                    setFormData(prev => ({
                        ...prev,
                        projections: "Maximum",
                        present: element.improvementsNeeded.toImprove.attendance,
                        late: 0,
                        substitutes: 0,
                        medical: 0,
                        rgo: element.improvementsNeeded.toImprove.referrals,
                        rgi: 0,
                        one2ones: element.improvementsNeeded.toImprove.oneToOnes,
                        ceus: element.improvementsNeeded.toImprove.attendance,
                        visitors: element.improvementsNeeded.toImprove.visitors,
                    }));
                }
                if (element.levelName != 'Green') {
                    setFormData(prev => ({
                        ...prev,
                        projections: "Next Level",
                        present: element.improvementsNeeded.toNextLevel.attendance,
                        late: 0,
                        substitutes: 0,
                        medical: 0,
                        rgo: element.improvementsNeeded.toNextLevel.referrals,
                        rgi: 0,
                        one2ones: element.improvementsNeeded.toNextLevel.oneToOnes,
                        ceus: element.improvementsNeeded.toNextLevel.attendance,
                        visitors: element.improvementsNeeded.toNextLevel.visitors,
                    }));
                }
            }
        });


    }

    useEffect(() => {
        getDataFromN8n();
    }, []);
    useEffect(() => {
    }, [totalScoreCustom]);

    const handleChangeFormdata = (e) => {
        const { name, value, type } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === "number" ? parseInt(value || "0") : value,
        }));
        if (value == 'Custom') {
            setActiveTabProjections(value);
            setEditable(false);
        } if (value == 'Next Level' || value == 'Green' || value == 'Maximum') {
            setActiveTabProjections(value);
            setEditable(true);
        }
    };
    const getNextScore = () => {
        if (activeTabProjections != 'Custom') {
            if (selectedMember.levelName != 'Green') {
                return Number(selectedMember.currentScore) + Number(selectedMember.improvementsNeeded.pointsToNextLevel);
            }
            if (selectedMember.levelName == 'Green') {
                return 100 - Number(selectedMember.currentScore);
            }
        }
        if (activeTabProjections == 'Custom') {
            return totalScoreCustom;
        }

    }
    const calculateCustomScore = () => {
        console.log(selectedMember)
        const date = new Date(selectedMember.currentMetrics.currentDate);
        const month = date.getMonth() + 1; // getMonth() returns 0-based index
        const year = date.getFullYear();
        var medical = formData.medical;
        var substitutes = formData.substitutes;
        var referrals = Number(formData.rgo) + Number(formData.rgi);
        var visitors = formData.visitors;
        var one2ones = formData.one2ones;
        var ceus = formData.ceus;
        var present = formData.present;
        var late = formData.late;

        referrals = Number(referrals) + Number(selectedMember.improvementsNeeded.totalReferralsFiveMonths);
        visitors = Number(visitors) + Number(selectedMember.improvementsNeeded.totalVisitorsFiveMonths);
        one2ones = Number(one2ones) + Number(selectedMember.improvementsNeeded.total121sFiveMonths);
        ceus = Number(ceus) + Number(selectedMember.improvementsNeeded.totalCEUFiveMonths);
        present = Number(present) + Number(selectedMember.improvementsNeeded.totalPresentsFiveMonths);
        late = Number(late) + Number(selectedMember.improvementsNeeded.totalLatesFiveMonths);
        medical = Number(medical) + Number(selectedMember.improvementsNeeded.totalMedicalFiveMonths);
        substitutes = Number(substitutes) + Number(selectedMember.improvementsNeeded.totalSubstitutesFiveMonths);

        var totalMeetings = getWednesdaysInMonth(month + '/' + year);
        totalMeetings = totalMeetings + Number(selectedMember.improvementsNeeded.weeksActiveFiveMonths);
        var weeksActive = totalMeetings;
        var weeksInPeriod = totalMeetings;

        weeksActive = weeksActive - medical;
        weeksInPeriod = weeksInPeriod - medical;
        totalMeetings = totalMeetings - medical;

        weeksActive = weeksActive - substitutes;
        weeksInPeriod = weeksInPeriod - substitutes;
        totalMeetings = totalMeetings - substitutes;

        const referralsPerWeek = weeksInPeriod ? referrals / weeksInPeriod : 0;
        const visitorsPerWeek = weeksInPeriod ? visitors / weeksInPeriod : 0;
        const oneToOnesPerWeek = weeksInPeriod ? one2ones / weeksInPeriod : 0;
        const ceuPerWeek = weeksInPeriod ? ceus / weeksInPeriod : 0;


        const referralPoints = getReferralPoints(referralsPerWeek);
        const visitorPoints = getVisitorPoints(visitorsPerWeek);
        const oneToOnePoints = get121Points(oneToOnesPerWeek);
        const ceuPoints = getCEUPoints(ceuPerWeek);
        const attendancePoints = getAttendancePoints(present, substitutes, late, totalMeetings);
        const totalScore = attendancePoints + referralPoints + visitorPoints + oneToOnePoints + ceuPoints;
        setTotalScoreCustom(totalScore)
        console.log(totalScore)
    }
    const substractReading = (reading1, reading2) => {
        return Number(reading1) - Number(reading2);
    }
    return (
        <div>
            {loader && (
                <>
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </>

            )}

            {after_six_month_calculations.length != 0 &&
                <div className="min-h-screen bg-red-700 p-6">
                    <div className="bg-white max-w-6xl mx-auto rounded-2xl p-6 shadow-lg">
                        {/* Top bar */}
                        {/* <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <select className="border border-gray-300 rounded px-4 py-2 w-48"
                value={selectedMember.memberName}
                onChange={handleChange}
              >

                {after_six_month_calculations.map((member, index) => (
                  <option key={index} value={member.memberName} >
                    {member.memberName}
                  </option>
                ))}
              </select>

              <select className="border border-gray-300 rounded px-4 py-2 w-48"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >


                <option key='1' value='april' >
                  April
                </option>
                <option key='2' value='may' >
                  May
                </option>
                <option key='3' value='june' >
                  June
                </option>

              </select>
              <div className="flex gap-2" style={{ margin: 'auto' }}>
                <button
                  className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'current'
                    ? 'bg-red-700 text-white red-clr'
                    : 'bg-gray-200 text-gray-500'
                    }`}
                  onClick={() => setActiveTab('current')}
                >
                  Current
                </button>
                <button
                  className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'levelUp'
                    ? 'bg-red-700 text-white red-clr'
                    : 'bg-gray-200 text-gray-500'
                    }`}
                  onClick={() => setActiveTab('levelUp')}
                >
                  Level Up
                </button>
              </div>
            </div> */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2 mb-6">
                            <select
                                className="border border-gray-300 rounded px-4 py-2 w-48"
                                value={selectedMember.memberName}
                                onChange={handleChange}
                            >
                                {after_six_month_calculations.map((member, index) => (
                                    <option key={index} value={member.memberName}>
                                        {member.memberName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border border-gray-300 rounded px-4 py-2 w-48"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option key="1" value="april">
                                    April
                                </option>
                                <option key="2" value="may">
                                    May
                                </option>
                                <option key="3" value="june">
                                    June
                                </option>
                            </select>
                        </div>

                        {selectedMember.length != 0 &&
                            <>
                                {activeTab === 'current' ? (
                                    // Current tab content
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div className="bg-gray-100 p-4 rounded-xl text-left">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-semibold">{getMonthName(selectedMember?.currentPoints?.adjustedStartDateNewUser)} - {getMonthName(selectedMember?.currentMetrics?.getLastMonth)}'s Performance</span>{' '}
                                                    <span>(last 6 months)</span>
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    Strategic Partner:{' '}
                                                    <span className="text-blue-600 underline">{selectedMember.memberName}</span>
                                                </p>
                                                <p className="font-bold text-lg mt-2">{selectedMember.memberName}</p>
                                                <p className="text-sm text-gray-700">Business Name</p>
                                                <p className="text-sm text-gray-500 mt-1">Role(s)</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                                    <span className="text-sm">{selectedMember.powerTeam}</span>
                                                </div>
                                            </div>

                                            <div className="bg-gray-100 p-4 rounded-xl text-left text-sm space-y-2">
                                                <p className="font-bold">{getMonthName(selectedMember?.currentMetrics?.getLastMonth)}’s Performance</p>
                                                <p className="text-blue-700">⬆️ 10 points from last month</p>

                                                <div>
                                                    <p className="font-semibold">Attendance</p>
                                                    <p>Present</p>
                                                    <p>{selectedMember?.currentMonth?.presents} of {Number(getWednesdaysInMonth('03/2025'))}</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">Referrals</p>
                                                    <p>RGO:  {selectedMember?.currentMonth?.rgo ?? 0}{" "}
                                                        {selectedMember?.currentMonth?.rgo > selectedMember?.previousMonth?.rgo ? '⬆️' : '⬇️'}{" "}
                                                        {substractReading(selectedMember?.currentMonth?.rgo, selectedMember?.previousMonth?.rgo)}</p>


                                                    <p>RGI: {selectedMember?.currentMonth?.rgi ?? 0}{" "}
                                                        {selectedMember?.currentMonth?.rgi > selectedMember?.previousMonth?.rgi ? '⬆️' : '⬇️'}{" "}
                                                        {substractReading(selectedMember?.currentMonth?.rgi, selectedMember?.previousMonth?.rgi)}</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">1-2-1s</p>
                                                    <p>
                                                        {selectedMember?.currentMonth?.oneToOnes ?? 0}{" "}
                                                        {selectedMember?.currentMonth?.oneToOnes > selectedMember?.previousMonth?.oneToOnes ? '⬆️' : '⬇️'}{" "}
                                                        {substractReading(selectedMember?.currentMonth?.oneToOnes, selectedMember?.previousMonth?.oneToOnes)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">CEUs</p>
                                                    <p>
                                                        {selectedMember?.currentMonth?.ceu ?? 0}{" "}
                                                        {selectedMember?.currentMonth?.ceu > selectedMember?.previousMonth?.ceu ? '⬆️' : '⬇️'}{" "}
                                                        {substractReading(selectedMember?.currentMonth?.ceu, selectedMember?.previousMonth?.ceu)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">Visitors</p>
                                                    <p>
                                                        {selectedMember?.currentMonth?.visitors ?? 0}{" "}
                                                        {selectedMember?.currentMonth?.visitors > selectedMember?.previousMonth?.visitors ? '⬆️' : '⬇️'}{" "}
                                                        {substractReading(selectedMember?.currentMonth?.visitors, selectedMember?.previousMonth?.visitors)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center Column */}
                                        <div className="bg-gray-100 p-4 rounded-xl text-left text-sm">
                                            <p className="font-bold text-xl mb-2 text-center">Current Score</p>
                                            <p className="text-4xl font-bold text-center mb-4">{selectedMember.currentScore}</p>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-semibold">Attendance: {selectedMember?.currentPoints?.attendance} points</p>
                                                    <p>100%</p>
                                                    <p>Present: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalPresents ? selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalPresents : 0}</p>
                                                    <p>Late: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalLates ? selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalLates : 0}</p>
                                                    <p>Substitutes: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalSubstitutes ? selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalSubstitutes : 0}</p>
                                                    <p>Medical: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalMedicalsLeaves ? selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalMedicalsLeaves : 0}</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">Referrals: {selectedMember?.currentPoints?.referrals} points</p>
                                                    <p>RGO: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalReferralsSend} ⬆️ 10</p>
                                                    <p>RGI: {selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalReferralsRecieved} ⬆️ 10</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">1-2-1s: {selectedMember?.currentPoints?.oneToOnes}  points</p>
                                                    <p>{selectedMember?.currentMetrics?.totalOfAllSixMonths?.total121s} ⬆️ 10</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">CEUs: {selectedMember?.currentPoints?.ceus}  points</p>
                                                    <p>{selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalCEU} ⬆️ 10</p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">Visitors: {selectedMember?.currentPoints?.visitors}  points</p>
                                                    <p>{selectedMember?.currentMetrics?.totalOfAllSixMonths?.totalVisitors} ⬆️ 10</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Placeholder Cards */}
                                        <div className="space-y-4">
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                        </div>
                                    </div>
                                ) : (

                                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm w-full">
                                        <div className="lg:col-span-1 ">
                                            <div class="grid grid-rows-1">


                                                <h2 className="font-semibold text-lg mb-1 text-gray-800">{getMonthName(selectedMember?.currentPoints?.adjustedStartDateNewUser)} - {getMonthName(selectedMember?.currentMetrics?.currentDate)} Forecast</h2>
                                                <p className="mb-4 text-gray-600 text-sm">Envision your future then take action. Fill out the values below.</p>

                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-16 h-16 bg-gray-300 rounded" />
                                                    <div>
                                                        <div className="font-medium text-gray-800">Name</div>
                                                        <div className="text-gray-500 text-xs">Role(s)</div>
                                                        <div className="mt-1 text-gray-800">Business Name</div>
                                                        <div className="text-gray-500 text-xs">Power Team</div>
                                                    </div>
                                                </div>


                                                <div className="mt-4 flex items-start justify-between gap-4">
                                                    {/* Left side: Label + select */}
                                                    <div>
                                                        <label className="block font-medium text-gray-700 mb-1">{getNextMonthName(selectedMember?.currentMetrics?.currentDate)}’s Projections</label>
                                                        <select
                                                            name="projections"
                                                            value={formData.projections}
                                                            onChange={handleChangeFormdata}
                                                            className="border p-2 w-40 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="Next Level">Next Level</option>
                                                            <option value="Green">Green</option>
                                                            <option value="Maximum">Maximum</option>
                                                            <option value="Custom">Custom</option>
                                                        </select>
                                                    </div>

                                                    {/* Right side: Score */}
                                                    <div className="text-right">
                                                        <label className="block font-medium text-gray-700 mb-1">Future Score</label>
                                                        <div className="text-gray-800 font-semibold">{getNextScore()}</div>
                                                    </div>
                                                </div>


                                                <div className=" mt-4">

                                                    <label className="block font-medium text-gray-700 mb-1" style={{ textAlign: 'left' }}>Attendance</label>
                                                    <div className="flex items-center mb-2">
                                                        <input
                                                            type="number"
                                                            name="present"
                                                            value={formData.present}
                                                            onChange={handleChangeFormdata}
                                                            className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            min="0"
                                                            max="5"
                                                            readOnly={editable}
                                                        />
                                                        <span className="text-gray-600" >of 5</span>

                                                    </div>
                                                    {["late", "substitutes", "medical"].map((field) => (
                                                        <div className=" text-left  mb-2" key={field}>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                                                            <input
                                                                type="number"
                                                                name={field}
                                                                value={formData[field]}
                                                                onChange={handleChangeFormdata}
                                                                className="border rounded p-1 w-16 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                readOnly={editable}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4">
                                                    <label className="block font-medium text-gray-700 mb-1" style={{ textAlign: 'left' }}>Referrals</label>
                                                    {["rgo", "rgi"].map((field) => (
                                                        <div className=" text-left  mb-2" key={field}>
                                                            <label className="text-gray-700 block mb-1 uppercase" style={{ textAlign: 'left' }}>{field}</label>
                                                            <input
                                                                type="number"
                                                                name={field}
                                                                style={{ maxWidth: '74px' }}
                                                                value={formData[field]}
                                                                onChange={handleChangeFormdata}
                                                                className="border rounded p-1 w-16 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                readOnly={editable}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4">
                                                    {["one2ones", "ceus", "visitors"].map((field) => (
                                                        <div className=" text-left  mb-2" key={field}>
                                                            <label className="text-gray-700 block mb-1 uppercase" style={{ textAlign: 'left' }}>{field}</label>
                                                            <input
                                                                type="number"
                                                                name={field}
                                                                style={{ maxWidth: '74px' }}
                                                                value={formData[field]}
                                                                onChange={handleChangeFormdata}
                                                                className="border rounded p-1 w-16 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                readOnly={editable}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {formData.projections == 'Custom' &&
                                                <button
                                                    onClick={() => calculateCustomScore()}
                                                    className="!bg-red-600 text-white">
                                                    Calculate
                                                </button>}

                                        </div>



                                        <div className="space-y-4">
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                            <div className="bg-gray-200 rounded-xl h-24"></div>
                                        </div>

                                    </div>
                                )}</>}
                    </div>
                </div>}
            <ModalWithLoader isOpen={modalOpen} onClose={() => setModalOpen(false)} getMemberTrendsModal={getMemberTrendsModal} />
        </div>
    )
}

export default appsixmonth
