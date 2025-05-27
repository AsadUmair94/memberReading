import { useEffect, useState } from "react";
import "./App.css";
import ModalWithLoader from "./ModalWithLoader/ModalWithLoader";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import {
  checkMonthlyDataExists,
  pushDataForDate,
} from "./Firebase/AddDatainFirebase";
function App() {
  const [loader, setLoader] = useState(false);
  const [editable, setEditable] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [after_six_month_calculations, setAfter_six_month_calculations] =
    useState([]);
  const [selectedMember, setSelectedMember] = useState([]);
  const [totalScoreCustom, setTotalScoreCustom] = useState();
  const [selectedMonth, setSelectedMonth] = useState();
  const [activeTabProjections, setActiveTabProjections] =
    useState("Next Level");
  const [availableMonths, setAvailableMonths] = useState([]);

  const [referralsExtraSheet, setReferralsExtraSheet] = useState();
  const [visitorsExtraSheet, setVisitorsExtraSheet] = useState();
  const [one2onesExtraSheet, setOne2onesExtraSheet] = useState();
  const [ceusExtraSheet, setCeusExtraSheet] = useState();
  const [presentExtraSheet, setPresentExtraSheet] = useState();
  const [lateExtraSheet, setLateExtraSheet] = useState();
  const [medicalExtraSheet, setMedicalExtraSheet] = useState();
  const [substitutesExtraSheet, setSubstitutesExtraSheet] = useState();

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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const getStatusMonths = () => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    const prevIndex = (currentMonthIndex + 11) % 12; // handle January wrap
    const nextIndex = (currentMonthIndex + 1) % 12;

    return [
      {
        name: monthNames[prevIndex],
        status: "passed",
        value: monthNames[prevIndex].toLowerCase(),
      },
      {
        name: monthNames[currentMonthIndex],
        status: "present",
        value: monthNames[currentMonthIndex].toLowerCase(),
      },
      {
        name: monthNames[nextIndex],
        status: "future",
        value: monthNames[nextIndex].toLowerCase(),
      },
    ];
  };
  function getWednesdaysInMonth(monthYear) {
    const [monthStr, yearStr] = monthYear.split("/");
    const month = parseInt(monthStr) - 1; // JavaScript months are 0-based
    const year = parseInt("20" + yearStr); // Convert "25" to 2025

    let count = 0;

    // Loop through all days in the month
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === 3) {
        // 3 = Wednesday
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
      if (date.getDay() === 3) {
        // 3 = Wednesday
        count++;
      }
      date.setDate(date.getDate() + 1);
    }

    return count;
  }
  const getAttendancePoints = (presents, substitutes, lates, totalMeetings) => {
    // Convert substitutes and lates to equivalent presents (0.5 each)
    const effectivePresents = presents + substitutes * 0.5 + lates * 0.5;
    const attendanceRate =
      totalMeetings > 0 ? effectivePresents / totalMeetings : 0;

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
    const date = new Date(aa);

    return monthNames[date.getMonth()];
  };
  const getNextMonthName = (aa) => {
    const date = new Date(aa);
    const nextMonthIndex = (date.getMonth() + 1) % 12;

    return monthNames[nextMonthIndex];
  };
  const getNextMonthNametwice = (aa, val) => {
    const date = new Date(aa);
    const nextMonthIndex = (date.getMonth() + val) % 12;

    return monthNames[nextMonthIndex];
  };
  async function getMemberTrendsModal() {
    setModalOpen(false);
    setLoader(false);
    var months = getStatusMonths();

    getDataFromN8n(months);
  }

  async function getMemberTrends() {
    setLoader(true);
    try {
      const res = await fetch(
        "https://roilevelup.app.n8n.cloud/webhook/memberTrends",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        setLoader(false);
        setModalOpen(true);
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      //  console.log('=======>',data)
      const membersArray = Object.entries(data).map(([name, data]) => ({
        member_name: name,
        memberName: name,
        ...data,
      }));

      return membersArray; // return result after fetch is done
    } catch (error) {
      setLoader(false);
      console.error("Error fetching member trends:", error);
      setModalOpen(true);
      return []; // return empty list on error
    }
  }
  const getDataFromN8n = async (months) => {
    var all_mmbers = await getMemberTrends();
    console.log(all_mmbers);
    pushDataForDate(all_mmbers);
    setAfter_six_month_calculations(all_mmbers);
    var selectedOne = all_mmbers[0];
    setSelectedMember(selectedOne);
    // if (selectedOne.levelName == 'Green') {
    //   setFormData(prev => ({
    //     ...prev,
    //     projections: "Maximum",
    //     present: selectedOne.improvementsNeeded.toImprove.attendance,
    //     late: 0,
    //     substitutes: 0,
    //     medical: 0,
    //     rgo: selectedOne.improvementsNeeded.toImprove.referrals,
    //     rgi: 0,
    //     one2ones: selectedOne.improvementsNeeded.toImprove.oneToOnes,
    //     ceus: selectedOne.improvementsNeeded.toImprove.attendance,
    //     visitors: selectedOne.improvementsNeeded.toImprove.visitors,
    //   }));
    // }
    // if (selectedOne.levelName != 'Green') {
    //   setFormData(prev => ({
    //     ...prev,
    //     projections: "Next Level",
    //     present: selectedOne.improvementsNeeded.toNextLevel.attendance,
    //     late: 0,
    //     substitutes: 0,
    //     medical: 0,
    //     rgo: selectedOne.improvementsNeeded.toNextLevel.referrals,
    //     rgi: 0,
    //     one2ones: selectedOne.improvementsNeeded.toNextLevel.oneToOnes,
    //     ceus: selectedOne.improvementsNeeded.toNextLevel.attendance,
    //     visitors: selectedOne.improvementsNeeded.toNextLevel.visitors,
    //   }));
    // }
    setEditable(true);
    setLoader(false);
    if (months) {
      changeMonth(months[0].value, months, selectedOne);
    }
  };
  const handleChange = async (event) => {
    const value = event.target.value;

    if (value != "member_sheet") {
      after_six_month_calculations.forEach((element) => {
        if (element.memberName == value) {
          setSelectedMember(element);
          console.log(element);

          // if (element.levelName == 'Green') {
          //   setFormData(prev => ({
          //     ...prev,
          //     projections: "Maximum",
          //     present: element.improvementsNeeded.toImprove.attendance,
          //     late: 0,
          //     substitutes: 0,
          //     medical: 0,
          //     rgo: element.improvementsNeeded.toImprove.referrals,
          //     rgi: 0,
          //     one2ones: element.improvementsNeeded.toImprove.oneToOnes,
          //     ceus: element.improvementsNeeded.toImprove.attendance,
          //     visitors: element.improvementsNeeded.toImprove.visitors,
          //   }));
          // }
          // if (element.levelName != 'Green') {
          //   setFormData(prev => ({
          //     ...prev,
          //     projections: "Next Level",
          //     present: element.improvementsNeeded.toNextLevel.attendance,
          //     late: 0,
          //     substitutes: 0,
          //     medical: 0,
          //     rgo: element.improvementsNeeded.toNextLevel.referrals,
          //     rgi: 0,
          //     one2ones: element.improvementsNeeded.toNextLevel.oneToOnes,
          //     ceus: element.improvementsNeeded.toNextLevel.attendance,
          //     visitors: element.improvementsNeeded.toNextLevel.visitors,
          //   }));
          // }
        }
      });
    } else {
      setSelectedMember("member_sheet");
    }
  };

  useEffect(async () => {
    setAvailableMonths(getStatusMonths());
    var months = getStatusMonths();

    const data = await checkMonthlyDataExists();
    if (!data) {
      getDataFromN8n(months);
    } else {
      //  console.log('d=======>',data?.data)
      // setLoader(true);
      setAfter_six_month_calculations(data?.data);
      var selectedOne = data?.data[0];
      setSelectedMember(selectedOne);
      changeMonth(months[0].value, months, selectedOne);
      setEditable(true);
      // setTimeout(() => {
      //   setLoader(false);
      // }, 1500);
    }
  }, []);

  const handleChangeFormdata = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "number" ? parseInt(value || "0") : value,
    }));
    if (value == "Custom") {
      setActiveTabProjections(value);
      setEditable(false);
    }
    if (value == "Next Level") {
      setActiveTabProjections(value);
      setEditable(true);
      setFormData({
        projections: "Next Level",
        present: selectedMember.improvementsExtraSheet.toNextLevel.attendance,
        late: 0,
        substitutes: 0,
        medical: 0,
        rgo: 0,
        rgi: selectedMember.improvementsExtraSheet.toNextLevel.referrals,
        one2ones: selectedMember.improvementsExtraSheet.toNextLevel.oneToOnes,
        ceus: selectedMember.improvementsExtraSheet.toNextLevel.ceus,
        visitors: selectedMember.improvementsExtraSheet.toNextLevel.visitors,
      });
      setTotalScoreCustom(
        Number(selectedMember.improvementsExtraSheet.pointsToNextLevel) +
          Number(selectedMember.currentScore)
      );
    }
    if (value == "Green") {
      setActiveTabProjections(value);
      setEditable(true);
      setFormData({
        projections: "Green",
        present: selectedMember.improvementsExtraSheet.toGreen.attendance,
        late: 0,
        substitutes: 0,
        medical: 0,
        rgo: 0,
        rgi: selectedMember.improvementsExtraSheet.toGreen.referrals,
        one2ones: selectedMember.improvementsExtraSheet.toGreen.oneToOnes,
        ceus: selectedMember.improvementsExtraSheet.toGreen.ceus,
        visitors: selectedMember.improvementsExtraSheet.toGreen.visitors,
      });
    }
    if (value == "Maximum") {
      setActiveTabProjections(value);
      setEditable(true);
    }
  };
  const getNextScore = () => {
    if (activeTabProjections != "Custom") {
      if (selectedMember.levelName != "Green") {
        return (
          Number(selectedMember.currentScore) +
          Number(selectedMember.improvementsNeeded.pointsToNextLevel)
        );
      }
      if (selectedMember.levelName == "Green") {
        return 100 - Number(selectedMember.currentScore);
      }
    }
    if (activeTabProjections == "Custom") {
      return totalScoreCustom;
    }
  };
  const calculateCustomScore = (type, member) => {
    console.log(member);
    const date = new Date(member.currentMetrics.currentDate);
    const month = date.getMonth() + 1; // getMonth() returns 0-based index
    const year = date.getFullYear();

    if (type == "present") {
      var medical = member.currentMetrics.latestMonth.prior_last_Medical;
      var substitutes =
        member.currentMetrics.latestMonth.prior_last_substitutes;
      var referrals =
        Number(member.currentMetrics.latestMonth.prior_last_RGI) +
        Number(member.currentMetrics.latestMonth.prior_last_RGO);
      var visitors = member.currentMetrics.latestMonth.prior_last_visitors;
      var one2ones = member.currentMetrics.latestMonth.prior_last_121s;
      var ceus = member.currentMetrics.latestMonth.prior_last_ceu;
      var present = member.currentMetrics.latestMonth.prior_last_presents;
      var late = member.currentMetrics.latestMonth.prior_last_Medical;

      setFormData({
        projections: "Maximum",
        present: present,
        late: late,
        substitutes: substitutes,
        medical: medical,
        rgo: member.currentMetrics.latestMonth.prior_last_RGO,
        rgi: member.currentMetrics.latestMonth.prior_last_RGI,
        one2ones: one2ones,
        ceus: ceus,
        visitors: visitors,
      });

      referrals =
        Number(referrals) +
        Number(member.improvementsNeeded.totalReferralsFiveMonths);
      visitors =
        Number(visitors) +
        Number(member.improvementsNeeded.totalVisitorsFiveMonths);
      one2ones =
        Number(one2ones) +
        Number(member.improvementsNeeded.total121sFiveMonths);
      ceus =
        Number(ceus) + Number(member.improvementsNeeded.totalCEUFiveMonths);
      present =
        Number(present) +
        Number(member.improvementsNeeded.totalPresentsFiveMonths);
      late =
        Number(late) + Number(member.improvementsNeeded.totalLatesFiveMonths);
      medical =
        Number(medical) +
        Number(member.improvementsNeeded.totalMedicalFiveMonths);
      substitutes =
        Number(substitutes) +
        Number(member.improvementsNeeded.totalSubstitutesFiveMonths);
      var newChange = member;

      newChange.currentMetrics.totalOfAllSixMonths.totalPresents = present;
      newChange.currentMetrics.totalOfAllSixMonths.totalVisitors = visitors;
      newChange.currentMetrics.totalOfAllSixMonths.total121s = one2ones;
      newChange.currentMetrics.totalOfAllSixMonths.totalCEU = ceus;
      newChange.currentMetrics.totalOfAllSixMonths.totalLates = late;
      newChange.currentMetrics.totalOfAllSixMonths.totalMedicalsLeaves =
        medical;
      newChange.currentMetrics.totalOfAllSixMonths.totalSubstitutes =
        substitutes;
      newChange.currentMetrics.totalOfAllSixMonths.totalReferrals = referrals;

      var totalMeetings = getWednesdaysInMonth(month + "/" + year);
      totalMeetings =
        totalMeetings + Number(member.improvementsNeeded.weeksActiveFiveMonths);
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
      const attendancePoints = getAttendancePoints(
        present,
        substitutes,
        late,
        totalMeetings
      );
      // const totalScore = attendancePoints + referralPoints + visitorPoints + oneToOnePoints + ceuPoints;

      newChange.currentPoints.referrals = referralPoints;
      newChange.currentPoints.oneToOnes = oneToOnePoints;
      newChange.currentPoints.visitors = visitorPoints;
      newChange.currentPoints.attendance = attendancePoints;
      newChange.currentPoints.ceus = ceuPoints;

      setSelectedMember(newChange);
      setTotalScoreCustom(member.extraSheetValues.totalScoreExtraSheet);
    }

    if (type == "future") {
      setEditable(true);
      if (member.currentLevel != 4) {
        setFormData({
          projections: "Next Level",
          present: member.improvementsExtraSheet.toNextLevel.attendance,
          late: 0,
          substitutes: 0,
          medical: 0,
          rgo: 0,
          rgi: member.improvementsExtraSheet.toNextLevel.referrals,
          one2ones: member.improvementsExtraSheet.toNextLevel.oneToOnes,
          ceus: member.improvementsExtraSheet.toNextLevel.ceus,
          visitors: member.improvementsExtraSheet.toNextLevel.visitors,
        });
        setTotalScoreCustom(
          Number(member.improvementsExtraSheet.pointsToNextLevel) +
            Number(member.currentScore)
        );
      }
    }
  };
  const calculateScoreFuture = () => {
    console.log(selectedMember);
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

    referrals =
      Number(referrals) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalReferralsFiveMonthsExtraSheet
      );
    visitors =
      Number(visitors) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalVisitorsFiveMonthsExtraSheet
      );
    one2ones =
      Number(one2ones) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .total121sFiveMonthsExtraSheet
      );
    ceus =
      Number(ceus) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalCEUFiveMonthsExtraSheet
      );
    present =
      Number(present) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalPresentsFiveMonthsExtraSheet
      );
    late =
      Number(late) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalLatesFiveMonthsExtraSheet
      );
    medical =
      Number(medical) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalMedicalFiveMonthsExtraSheet
      );
    substitutes =
      Number(substitutes) +
      Number(
        selectedMember.improvementsNeeded.extraSheetValuesFiveMonth
          .totalSubstitutesFiveMonthsExtraSheet
      );

    var totalMeetings = getWednesdaysInMonth(month + "/" + year);
    totalMeetings =
      totalMeetings +
      Number(selectedMember.improvementsExtraSheet.weeksActiveFiveMonths);
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
    const attendancePoints = getAttendancePoints(
      present,
      substitutes,
      late,
      totalMeetings
    );
    const totalScore =
      attendancePoints +
      referralPoints +
      visitorPoints +
      oneToOnePoints +
      ceuPoints;
    setTotalScoreCustom(totalScore);
    console.log(totalScore);
  };
  const substractReading = (reading1, reading2) => {
    var return_number = Number(reading1) - Number(reading2);
    return Math.abs(return_number);
  };
  const returnStatus = () => {
    //getMonthName(selectedMember?.currentMetrics?.getLastMonth)}
    var status = availableMonths.filter((item) => item.value == selectedMonth);

    return status[0].status;
  };
  const changeMonth = (monthValue, listMonths, selcted_member) => {
    var all_months;
    var member;
    if (listMonths) {
      setSelectedMonth(monthValue);
      all_months = listMonths;
      member = selcted_member;
    } else {
      setSelectedMonth(monthValue);
      all_months = availableMonths;
      member = selectedMember;
    }
    console.log("selectedMember");
    console.log(member);
    var nowSelect = all_months.filter((item) => item.value == monthValue);
    nowSelect = nowSelect[0];
    if (nowSelect.status == "present") {
      setEditable(true);
      calculateCustomScore("present", member);
    }
    if (nowSelect.status == "passed") {
      setTotalScoreCustom(member.currentScore);
      setEditable(true);
      setFormData((prev) => ({
        ...prev,
        projections: "Maximum",
        present: member.currentMonth.presents,
        late: member.currentMonth.late,
        substitutes: member.currentMonth.substitutes,
        medical: member.currentMonth.medical,
        rgo: member.currentMonth.rgo,
        rgi: member.currentMonth.rgi,
        one2ones: member.currentMonth.oneToOnes,
        ceus: member.currentMonth.ceu,
        visitors: member.currentMonth.visitors,
      }));
    }
    if (nowSelect.status == "future") {
      setEditable(false);
      calculateCustomScore("future", member);
    }
    console.log(nowSelect);
  };
  useEffect(() => {
    document.body.style.backgroundColor = "#c10007"; // white
  }, []);
  return (
    <div className=" m-0 p-0">
      {loader && (
        <>
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        </>
      )}

      {after_six_month_calculations.length != 0 && (
        <>
          <div className="text-white text-[27px] font-bold">
            {" "}
            BNI Capital Business Alliance
          </div>
          <div className="min-h-screen bg-red-700 p-6 w-full">
            <div
              className="bg-white w-full rounded-2xl p-6 shadow-lg"
              style={{
                width:
                  selectedMember.length !== 0 &&
                  selectedMember === "member_sheet" &&
                  "61rem",
              }}
            >
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
              <div className="bg-[#FAF7F4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded">
                {/* Left side with selects */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2 text-black">
                  <select
                    className="border border-gray-300 rounded px-4 py-2 w-48 focus:outline-none focus:ring-0 "
                    value={selectedMember.memberName}
                    onChange={handleChange}
                  >
                    {after_six_month_calculations.map((member, index) => (
                      <>
                        <option key={index} value={member.memberName}>
                          {member.memberName}
                        </option>
                        <option key="index" value="member_sheet">
                          Chapter Analysis
                        </option>
                      </>
                    ))}
                  </select>

                  {selectedMember != "member_sheet" && (
                    <select
                      className="border border-gray-300 rounded px-4 py-2 w-48 focus:outline-none focus:ring-0"
                      value={selectedMonth}
                      onChange={(e) => changeMonth(e.target.value, "", "")}
                    >
                      {availableMonths.map((month, index) => (
                        <option key={index} value={month.value}>
                          {month.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Right side element */}

                <div>
                  {selectedMember.length != 0 &&
                    selectedMonth &&
                    returnStatus() == "passed" && (
                      <p className="text-black">
                        You will see this BNI{" "}
                        {getNextMonthNametwice(
                          selectedMember?.currentMetrics?.getLastMonth,
                          2
                        )}{" "}
                        1,2025
                      </p>
                    )}
                  {selectedMember.length != 0 &&
                    selectedMonth &&
                    returnStatus() == "present" && (
                      <p className="text-black">
                        You will see this BNI{" "}
                        {getNextMonthNametwice(
                          selectedMember?.currentMetrics?.getLastMonth,
                          3
                        )}{" "}
                        1,2025
                      </p>
                    )}
                  {selectedMember.length != 0 &&
                    selectedMonth &&
                    returnStatus() == "future" && (
                      <p className="text-black">
                        You will see this BNI{" "}
                        {getNextMonthNametwice(
                          selectedMember?.currentMetrics?.getLastMonth,
                          4
                        )}{" "}
                        1,2025
                      </p>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2  p-4 ">
                <div className="text-[18px] font-bold text-gray-800">
                  {selectedMonth} Score
                </div>
                <div className="text-[14px] text-black">{totalScoreCustom}</div>
                <div class="flex items-center justify-center w-3 h-3 rounded-full bg-yellow-400 text-xs font-bold text-gray-800"></div>
                <div className="flex items-center text-sm text-green-500">
                  <span className="font-medium">+10</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </div>
              {/* <div className="text-left mb-4">
              <div className="inline">


                <strong>{selectedMonth} Score</strong> {totalScoreCustom} 10 from last month
              </div>
            </div> */}
              {selectedMember.length != 0 &&
                selectedMonth &&
                returnStatus() == "passed" &&
                selectedMember != "member_sheet" && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-xl text-left">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">
                              {getMonthName(
                                selectedMember?.currentPoints
                                  ?.adjustedStartDateNewUser
                              )}{" "}
                              -{" "}
                              {getMonthName(
                                selectedMember?.currentMetrics?.getLastMonth
                              )}
                              's Performance
                            </span>{" "}
                            <span>(last 6 months)</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            Strategic Partner:{" "}
                            <span className="text-blue-600 underline">
                              {selectedMember.memberName}
                            </span>
                          </p>
                          <p className="font-bold text-lg mt-2">
                            {selectedMember.memberName}
                          </p>
                          <p className="text-sm text-gray-700">Business Name</p>
                          <p className="text-sm text-gray-500 mt-1">Role(s)</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="text-sm">
                              {selectedMember.powerTeam}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-xl text-left text-sm space-y-2">
                          <p className="font-bold">
                            {getMonthName(
                              selectedMember?.currentMetrics?.getLastMonth
                            )}
                            ’s Performance
                          </p>
                          <p className="text-blue-700 flex items-center gap-1">
                            <FaArrowUp color="#3CCB3A" />
                            10 points from last month
                          </p>

                          <div>
                            <p className="font-semibold">Attendance</p>
                            <p>Present</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="present"
                                value={formData.present}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                max="5"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap">
                                of {Number(getWednesdaysInMonth("03/2025"))}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Referrals</p>
                            <p className="flex items-center gap-1">RGO:</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="rgo"
                                value={formData.rgo}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              {/* <span className={selectedMember?.currentMonth?.rgo > selectedMember?.previousMonth?.rgo ? "text-green-600" : "text-red-600"}> */}
                              <span className="flex items-center gap-1">
                                {selectedMember?.currentMonth?.rgo >
                                selectedMember?.previousMonth?.rgo ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgo,
                                  selectedMember?.previousMonth?.rgo
                                )}
                              </span>
                            </div>

                            <p className="flex items-center gap-1">RGI:</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="rgi"
                                value={formData.rgi}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              {/* <span className={selectedMember?.currentMonth?.rgi > selectedMember?.previousMonth?.rgi ? "text-green-600" : "text-red-600"}> */}
                              <span className="flex items-center gap-1">
                                {selectedMember?.currentMonth?.rgi >
                                selectedMember?.previousMonth?.rgi ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgi,
                                  selectedMember?.previousMonth?.rgi
                                )}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">1-2-1s</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="one2ones"
                                value={formData.one2ones}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.oneToOnes >
                                selectedMember?.previousMonth?.oneToOnes ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.oneToOnes,
                                  selectedMember?.previousMonth?.oneToOnes
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">CEUs</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="ceu"
                                value={formData.ceus}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />

                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.ceu >
                                selectedMember?.previousMonth?.ceu ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.ceu,
                                  selectedMember?.previousMonth?.ceu
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Visitors</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="Visitors"
                                value={formData.visitors}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.visitors >
                                selectedMember?.previousMonth?.visitors ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.visitors,
                                  selectedMember?.previousMonth?.visitors
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="bg-gray-100 p-4 rounded-xl text-left text-sm">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">
                            {getMonthName(
                              selectedMember?.currentPoints
                                ?.adjustedStartDateNewUser
                            )}{" "}
                            -{" "}
                            {getMonthName(
                              selectedMember?.currentMetrics?.getLastMonth
                            )}
                            's Performance
                          </span>{" "}
                          <span>(last 6 months)</span>
                        </p>
                        <p className="font-bold text-xl mb-2 text-center">
                          Current Score
                        </p>
                        <p className="text-4xl font-bold text-center mb-4">
                          {selectedMember.currentScore}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-[22px]">
                              Attendance:{" "}
                              {selectedMember?.currentPoints?.attendance} points
                            </p>
                            <p>100%</p>
                            <p>
                              Present:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalPresents
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalPresents
                                : 0}
                            </p>
                            <p>
                              Late:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalLates
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalLates
                                : 0}
                            </p>
                            <p>
                              Substitutes:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalSubstitutes
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalSubstitutes
                                : 0}
                            </p>
                            <p>
                              Medical:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                : 0}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Referrals:{" "}
                              {selectedMember?.currentPoints?.referrals} points
                            </p>
                            <p className=" flex items-center gap-1">
                              RGO:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsSend
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                            <p className=" flex items-center gap-1">
                              RGI:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsRecieved
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              1-2-1s: {selectedMember?.currentPoints?.oneToOnes}{" "}
                              points
                            </p>
                            <p className=" flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.total121s
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              CEUs: {selectedMember?.currentPoints?.ceus} points
                            </p>
                            <p className=" flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalCEU
                              }
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Visitors:{" "}
                              {selectedMember?.currentPoints?.visitors} points
                            </p>
                            <p className=" flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalVisitors
                              }{" "}
                              <FaArrowUp color="#3CCB3A" />
                              10
                            </p>
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
                  </>
                )}
              {selectedMember.length != 0 &&
                selectedMonth &&
                returnStatus() == "present" &&
                selectedMember != "member_sheet" && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-xl text-left">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">
                              {getNextMonthName(
                                selectedMember?.currentPoints
                                  ?.adjustedStartDateNewUser
                              )}{" "}
                              -{" "}
                              {getNextMonthName(
                                selectedMember?.currentMetrics?.getLastMonth
                              )}
                              's Performance
                            </span>{" "}
                            <span>(last 6 months)</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            Strategic Partner:{" "}
                            <span className="text-blue-600 underline">
                              {selectedMember.memberName}
                            </span>
                          </p>
                          <p className="font-bold text-lg mt-2">
                            {selectedMember.memberName}
                          </p>
                          <p className="text-sm text-gray-700">Business Name</p>
                          <p className="text-sm text-gray-500 mt-1">Role(s)</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="text-sm">
                              {selectedMember.powerTeam}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-xl text-left text-sm space-y-2">
                          <p className="font-bold">
                            {getNextMonthName(
                              selectedMember?.currentMetrics?.getLastMonth
                            )}
                            ’s Performance
                          </p>
                          <p className="text-blue-700">
                            ⬆️ 10 points from last month
                          </p>

                          <div>
                            <p className="font-semibold">Attendance</p>
                            <p>Present</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="present"
                                value={formData.present}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                max="5"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap">
                                of {Number(getWednesdaysInMonth("03/2025"))}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Referrals</p>
                            <p className="flex items-center gap-1">
                              RGO:
                              <input
                                type="number"
                                name="rgo"
                                value={formData.rgo}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <span
                                className={
                                  selectedMember?.currentMonth?.rgo >
                                  selectedMember?.previousMonth?.rgo
                                    ? "text-green-600 flex items-center gap-1"
                                    : "text-red-600 flex items-center gap-1"
                                }
                              >
                                {selectedMember?.currentMonth?.rgo >
                                selectedMember?.previousMonth?.rgo ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgo,
                                  selectedMember?.previousMonth?.rgo
                                )}
                              </span>
                            </p>

                            <p className="flex items-center gap-1">
                              RGI:
                              <input
                                type="number"
                                name="rgi"
                                value={formData.rgi}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <span
                                className={
                                  selectedMember?.currentMonth?.rgi >
                                  selectedMember?.previousMonth?.rgi
                                    ? "text-green-600 flex items-center gap-1"
                                    : "text-red-600 flex items-center gap-1"
                                }
                              >
                                {selectedMember?.currentMonth?.rgi >
                                selectedMember?.previousMonth?.rgi ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgi,
                                  selectedMember?.previousMonth?.rgi
                                )}
                              </span>
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">1-2-1s</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="one2ones"
                                value={formData.one2ones}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.oneToOnes >
                                selectedMember?.previousMonth?.oneToOnes ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.oneToOnes,
                                  selectedMember?.previousMonth?.oneToOnes
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">CEUs</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="ceu"
                                value={formData.ceus}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.ceu >
                                selectedMember?.previousMonth?.ceu ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.ceu,
                                  selectedMember?.previousMonth?.ceu
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Visitors</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="Visitors"
                                value={formData.visitors}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.visitors >
                                selectedMember?.previousMonth?.visitors ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.visitors,
                                  selectedMember?.previousMonth?.visitors
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="bg-gray-100 p-4 rounded-xl text-left text-sm">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">
                            {getNextMonthName(
                              selectedMember?.currentPoints
                                ?.adjustedStartDateNewUser
                            )}{" "}
                            -{" "}
                            {getNextMonthName(
                              selectedMember?.currentMetrics?.getLastMonth
                            )}
                            's Performance
                          </span>{" "}
                          <span>(last 6 months)</span>
                        </p>
                        <p className="font-bold text-xl mb-2 text-center">
                          Current Score
                        </p>
                        <p className="text-4xl font-bold text-center mb-4">
                          {selectedMember.currentScore}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-[22px]">
                              Attendance:{" "}
                              {selectedMember?.currentPoints?.attendance} points
                            </p>
                            <p>100%</p>
                            <p>
                              Present:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalPresents
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalPresents
                                : 0}
                            </p>
                            <p>
                              Late:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalLates
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalLates
                                : 0}
                            </p>
                            <p>
                              Substitutes:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalSubstitutes
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalSubstitutes
                                : 0}
                            </p>
                            <p>
                              Medical:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                : 0}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Referrals:{" "}
                              {selectedMember?.currentPoints?.referrals} points
                            </p>
                            <p>
                              RGO:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsSend
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                            <p>
                              RGI:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsRecieved
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              1-2-1s: {selectedMember?.currentPoints?.oneToOnes}{" "}
                              points
                            </p>
                            <p>
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.total121s
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              CEUs: {selectedMember?.currentPoints?.ceus} points
                            </p>
                            <p>
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalCEU
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Visitors:{" "}
                              {selectedMember?.currentPoints?.visitors} points
                            </p>
                            <p>
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalVisitors
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
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
                  </>
                )}
              {selectedMember.length != 0 &&
                selectedMonth &&
                returnStatus() == "future" &&
                selectedMember != "member_sheet" && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-xl text-left">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">
                              {getNextMonthName(
                                selectedMember?.currentPoints
                                  ?.adjustedStartDateNewUser
                              )}{" "}
                              -{" "}
                              {getNextMonthName(
                                selectedMember?.currentMetrics?.getLastMonth
                              )}
                              's Performance
                            </span>{" "}
                            <span>(last 6 months)</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            Strategic Partner:{" "}
                            <span className="text-blue-600 underline">
                              {selectedMember.memberName}
                            </span>
                          </p>
                          <p className="font-bold text-lg mt-2">
                            {selectedMember.memberName}
                          </p>
                          <p className="text-sm text-gray-700">Business Name</p>
                          <p className="text-sm text-gray-500 mt-1">Role(s)</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="text-sm">
                              {selectedMember.powerTeam}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-xl text-left text-sm space-y-2">
                          <p className="font-bold">
                            {getNextMonthNametwice(
                              selectedMember?.currentMetrics?.getLastMonth,
                              2
                            )}
                            ’s Projection
                          </p>

                          <select
                            name="projections"
                            value={formData.projections}
                            onChange={handleChangeFormdata}
                            className="border p-2 w-full rounded shadow-sm focus:outline-none focus:ring-0 "
                          >
                            <option value="Next Level">Next Level</option>
                            <option value="Green">Green</option>
                            {selectedMember.improvementsExtraSheet?.toImprove
                              ?.attendance && (
                              <option value="Maximum">Maximum</option>
                            )}

                            <option value="Custom">Custom</option>
                          </select>

                          <div>
                            <p className="font-semibold">Attendance</p>
                            <p>Present</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="present"
                                value={formData.present}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                max="5"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap">
                                of {Number(getWednesdaysInMonth("03/2025"))}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Referrals</p>
                            <p className="flex items-center gap-1">
                              RGO:
                              <input
                                type="number"
                                name="rgo"
                                value={formData.rgo}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <span
                                className={
                                  selectedMember?.currentMonth?.rgo >
                                  selectedMember?.previousMonth?.rgo
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {selectedMember?.currentMonth?.rgo >
                                selectedMember?.previousMonth?.rgo ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgo,
                                  selectedMember?.previousMonth?.rgo
                                )}
                              </span>
                            </p>

                            <p className="flex items-center gap-1">
                              RGI:
                              <input
                                type="number"
                                name="rgi"
                                value={formData.rgi}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mx-1 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <span
                                className={
                                  selectedMember?.currentMonth?.rgi >
                                  selectedMember?.previousMonth?.rgi
                                    ? "text-green-600 flex items-center gap-1"
                                    : "text-red-600 flex items-center gap-1"
                                }
                              >
                                {selectedMember?.currentMonth?.rgi >
                                selectedMember?.previousMonth?.rgi ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}
                                {substractReading(
                                  selectedMember?.currentMonth?.rgi,
                                  selectedMember?.previousMonth?.rgi
                                )}
                              </span>
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">1-2-1s</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="one2ones"
                                value={formData.one2ones}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.oneToOnes >
                                selectedMember?.previousMonth?.oneToOnes ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.oneToOnes,
                                  selectedMember?.previousMonth?.oneToOnes
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">CEUs</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="ceu"
                                value={formData.ceus}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.ceu >
                                selectedMember?.previousMonth?.ceu ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.ceu,
                                  selectedMember?.previousMonth?.ceu
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold">Visitors</p>
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="Visitors"
                                value={formData.visitors}
                                onChange={handleChangeFormdata}
                                className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-0"
                                min="0"
                                readOnly={editable}
                              />
                              <p className="whitespace-nowrap flex items-center gap-1">
                                {selectedMember?.currentMonth?.visitors >
                                selectedMember?.previousMonth?.visitors ? (
                                  <FaArrowUp color="#3CCB3A" />
                                ) : (
                                  <FaArrowDown color="#C0192A" />
                                )}{" "}
                                {substractReading(
                                  selectedMember?.currentMonth?.visitors,
                                  selectedMember?.previousMonth?.visitors
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="bg-gray-100 p-4 rounded-xl text-left text-sm">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">
                            {getNextMonthNametwice(
                              selectedMember?.currentPoints
                                ?.adjustedStartDateNewUser,
                              2
                            )}{" "}
                            -{" "}
                            {getNextMonthNametwice(
                              selectedMember?.currentMetrics?.getLastMonth,
                              2
                            )}
                            's Performance
                          </span>{" "}
                          <span>(last 6 months)</span>
                        </p>
                        <p className="font-bold text-xl mb-2 text-center">
                          Future Score
                        </p>
                        <p className="text-4xl font-bold text-center mb-4">
                          {totalScoreCustom}
                        </p>

                        <div className="space-y-4">
                          {formData.projections == "Custom" && (
                            <button
                              onClick={() => calculateScoreFuture()}
                              style={{
                                borderRadius: "0px",
                              }}
                              className="!bg-red-600 text-white rounded-none"
                            >
                              Calculate
                            </button>
                          )}
                          <div>
                            <p className="font-semibold text-[22px]">
                              Attendance:{" "}
                              {selectedMember?.currentPoints?.attendance} points
                            </p>
                            <p>100%</p>
                            <p>
                              Present:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalPresents
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalPresents
                                : 0}
                            </p>
                            <p>
                              Late:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalLates
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalLates
                                : 0}
                            </p>
                            <p>
                              Substitutes:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalSubstitutes
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalSubstitutes
                                : 0}
                            </p>
                            <p>
                              Medical:{" "}
                              {selectedMember?.currentMetrics
                                ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                ? selectedMember?.currentMetrics
                                    ?.totalOfAllSixMonths?.totalMedicalsLeaves
                                : 0}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Referrals:{" "}
                              {selectedMember?.currentPoints?.referrals} points
                            </p>
                            <p className="flex items-center gap-1">
                              RGO:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsSend
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                            <p className="flex items-center gap-1">
                              RGI:{" "}
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalReferralsRecieved
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              1-2-1s: {selectedMember?.currentPoints?.oneToOnes}{" "}
                              points
                            </p>
                            <p className="flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.total121s
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              CEUs: {selectedMember?.currentPoints?.ceus} points
                            </p>
                            <p className="flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalCEU
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">
                              Visitors:{" "}
                              {selectedMember?.currentPoints?.visitors} points
                            </p>
                            <p className="flex items-center gap-1">
                              {
                                selectedMember?.currentMetrics
                                  ?.totalOfAllSixMonths?.totalVisitors
                              }{" "}
                              <FaArrowUp color="#3CCB3A" /> 10
                            </p>
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
                  </>
                )}
            </div>

            {selectedMember.length !== 0 &&
              selectedMember === "member_sheet" && (
                <div className="bg-white w-full rounded-2xl p-6 shadow-lg h-screen">
                  <iframe
                    src="https://docs.google.com/document/d/1oHvSNGSPNIKZ_Tp_CNctxWElP2E1pP40lAgxIoKDrLQ/edit?pli=1&tab=t.0#heading=h.82mvvcpz6b4r"
                    className="w-full h-full"
                    frameBorder="0"
                    title="Google Doc"
                  ></iframe>
                </div>
              )}
          </div>
        </>
      )}

      <ModalWithLoader
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        getMemberTrendsModal={getMemberTrendsModal}
      />
    </div>
  );
}

export default App;
