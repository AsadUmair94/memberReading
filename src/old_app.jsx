import { useEffect, useState } from 'react';
import './App.css'
import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
function old_app() {
  const [activeTab, setActiveTab] = useState('current');
  const [one_month, setOne_month] = useState([]);
  const [two_month, setTwo_month] = useState([]);
  const [three_month, setThree_month] = useState([]);
  const [four_month, setFour_month] = useState([]);
  const [five_month, setFive_month] = useState([]);
  const [six_month, setSix_month] = useState([]);
  const [after_six_month_calculations, setAfter_six_month_calculations] = useState([]);
  const [member_joing_data, setMember_joing_data] = useState([]);
  const [selectedMember, setSelectedMember] = useState([]);
  const [sheet_name1, setSheet_name1] = useState('');
  const [sheet_name2, setSheet_name2] = useState('');
  const [sheet_name3, setSheet_name3] = useState('');
  const [sheet_name4, setSheet_name4] = useState('');
  const [sheet_name5, setSheet_name5] = useState('');
  const [sheet_name6, setSheet_name6] = useState('');

  const [sheet_id1, setSheet_id1] = useState('');
  const [sheet_id2, setSheet_id2] = useState('');
  const [sheet_id3, setSheet_id3] = useState('');
  const [sheet_id4, setSheet_id4] = useState('');
  const [sheet_id5, setSheet_id5] = useState('');
  const [sheet_id6, setSheet_id6] = useState('');
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
  const [token, setToken] = useState(null);
  const SHEET_ID = '1BlEc7Xl5oO-_OvhhTHJcvJZZoSCKpp5ZAx8QD6b0OJc';
  const API_KEY = 'AIzaSyCrkAMIA2dsVdZ_2skgjBeRbE_IlA49HPs';
  const RANGE = '03/25!A10:P10';



  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    onSuccess: async (tokenResponse) => {
      setToken(tokenResponse.access_token);
    },
    onError: () => {
      alert('Login Failed');
    },
  });
  useEffect(async () => {
    getDataSheets();
  }, [])
  // useEffect(async () => {
  //   if (token) {




  //     await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID, {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

  //     })
  //       .then(res => res.json())
  //       .then(data => console.log(data));

  //     return;

  //     const fetchSheet = async () => {
  //       const res = await axios.get(
  //         'https://docs.google.com/spreadsheets/d/1BlEc7Xl5oO-_OvhhTHJcvJZZoSCKpp5ZAx8QD6b0OJc/edit?usp=sharing',
  //         // `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`,
  //         {
  //           headers: {
  //             //   Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       console.log('   console.log(res.data.values)')
  //       console.log(res)
  //       setData(res.data.values);
  //     };

  //     fetchSheet();
  //   }
  // }, [token]);
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
  const calculateStats = (member) => {
    // Calculate number of weeks since joining

    const getWednesdayCount = (start, end) => {
      let startDate = new Date(start);
      let endDate = new Date(end);

      // Swap if start > end
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      let count = 0;
      while (startDate <= endDate) {
        if (startDate.getDay() === 3) { // 3 = Wednesday
          count++;
        }
        startDate.setDate(startDate.getDate() + 1);
      }
      return count;
    };

    const month = '03';
    const year = '2025';
    var getLastMonthSheets = new Date(month + '-01-' + year);


    const getSixMonthsAgoStart = () => {
      // const today = new Date();
      var today = getLastMonthSheets;
      const nextMonth = new Date(getLastMonthSheets);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1); // Move to next month
      nextMonth.setUTCDate(5); // Set to 5th

      today = nextMonth.toISOString().split('T')[0];
      today = new Date(today);
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      return sixMonthsAgo;
    };

    const getAdjustedStartDate = (recentStartDate) => {
      const sixMonthsAgo = getSixMonthsAgoStart();
      return recentStartDate < sixMonthsAgo ? recentStartDate : sixMonthsAgo;
    };

    const adjustedStartDate = getAdjustedStartDate(member["Recent Start Date"]);
    // if user is new like he join after 6 months
    const adjustedStartDateNewUser = adjustedStartDate < new Date(member["Recent Start Date"]) ? new Date(member["Recent Start Date"]) : adjustedStartDate;

    // const getEndOfLastMonth = () => {
    //   const now = new Date();
    //   return new Date(now.getFullYear(), now.getMonth(), 0); // 0 = last day of previous month
    // };
    const getCustomLastDateOfMonth = (dateStr) => {
      const date = new Date(dateStr);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth(); // 0-based

      // Get the real last date of the month
      const actualLastDate = new Date(Date.UTC(year, month + 1, 0));
      const day = actualLastDate.getUTCDate();

      // If the last day is more than 30, cap it at 30
      const customLastDay = Math.min(day, 30);

      // Return date in YYYY-MM-DD format
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(customLastDay).padStart(2, '0')}`;
    };

    var totalMeetings = getWednesdayCount(adjustedStartDateNewUser, getCustomLastDateOfMonth(getLastMonthSheets));

    // Sum up attendance stats for all prior months - use safer parsing

    const startDate = adjustedStartDateNewUser;
    const currentDate = new Date(getCustomLastDateOfMonth(getLastMonthSheets));

    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var weeksActive = Math.max(1, Math.ceil((currentDate - startDate) / millisecondsPerWeek));
    //weeksActive = weeksActive - 1;

    // Cap at 25 weeks for consistency with original metrics
    var weeksInPeriod = Math.min(26, weeksActive);

    const parseIntSafe = (value) => {
      const parsed = parseInt(value || "0");
      return isNaN(parsed) ? 0 : parsed;
    };

    const totalMedicalsLeaves = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_Medical`]);
    }, 0);


    const totalPresents = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_presents`]);
    }, 0);

    const totalSubstitutes = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_substitutes`]);
    }, 0);

    const totalLates = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_late`]);
    }, 0);

    //subtract the medical leaves from total weeksActive 1 medical leave is equal to 1 week
    weeksActive = weeksActive - totalMedicalsLeaves;
    weeksInPeriod = weeksInPeriod - totalMedicalsLeaves;
    totalMeetings = totalMeetings - totalMedicalsLeaves;

    weeksActive = weeksActive - totalSubstitutes;
    weeksInPeriod = weeksInPeriod - totalSubstitutes;
    totalMeetings = totalMeetings - totalSubstitutes;

    // Calculate attendance points - UPDATED according to new guidelines
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
    const getAttendancePercent = (presents, substitutes, lates, totalMeetings) => {
      // Convert substitutes and lates to equivalent presents (0.5 each)
      const effectivePresents = presents + (substitutes * 0.5) + (lates * 0.5);
      const attendanceRate = totalMeetings > 0 ? effectivePresents / totalMeetings : 0;
      return Math.round(attendanceRate * 100 * 100) / 100;
    };
    const attendancePoints = getAttendancePoints(totalPresents, totalSubstitutes, totalLates, totalMeetings);
    const userAttendencePercent = getAttendancePercent(totalPresents, totalSubstitutes, totalLates, totalMeetings);
    // Sum up stats for past 6 months with safer parsing
    const totalReferrals = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_referrals`]);
    }, 0);

    const totalReferralsRecieved = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_RGI`]);
    }, 0);

    const totalReferralsSend = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_RGO`]);
    }, 0);
    const totalVisitors = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_visitors`]);
    }, 0);

    const total121s = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_121s`]);
    }, 0);

    const totalCEU = [1, 2, 3, 4, 5, 6].reduce((sum, i) => {
      return sum + parseIntSafe(member[`prior${i}_ceu`]);
    }, 0);

    // Calculate weekly averages - ensure non-zero divisor
    const referralsPerWeek = weeksInPeriod ? totalReferrals / weeksInPeriod : 0;
    const visitorsPerWeek = weeksInPeriod ? totalVisitors / weeksInPeriod : 0;
    const oneToOnesPerWeek = weeksInPeriod ? total121s / weeksInPeriod : 0;
    const ceuPerWeek = weeksInPeriod ? totalCEU / weeksInPeriod : 0;

    // Simplified point calculation functions
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

    // Assume default attendance of 0.95 if not provided
    const attendance = userAttendencePercent;
    const referralPoints = getReferralPoints(referralsPerWeek);
    const visitorPoints = getVisitorPoints(visitorsPerWeek);
    const oneToOnePoints = get121Points(oneToOnesPerWeek);
    const ceuPoints = getCEUPoints(ceuPerWeek);

    const totalScore = attendancePoints + referralPoints + visitorPoints + oneToOnePoints + ceuPoints;

    // Get current level
    const getCurrentLevel = (score) => {
      if (score >= 70) return 4; // Green
      if (score >= 50) return 3; // Yellow
      if (score >= 30) return 2; // Red
      return 1; // Grey
    };

    const currentLevel = getCurrentLevel(totalScore);
    const nextLevel = currentLevel < 4 ? currentLevel + 1 : 4;

    // Calculate target score for next level
    const getTargetScore = (level) => {
      switch (level) {
        case 2: return 30; // Target for Red
        case 3: return 50; // Target for Yellow
        case 4: return 70; // Target for Green
        default: return 100; // Max score
      }
    };


    // Simplified improvement calculations
    const calculateImprovementsNeeded = (currentScore, currentLevel, weeksActive) => {
      const totalReferralsFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_referrals`]);
      }, 0);
      const totalVisitorsFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_visitors`]);
      }, 0);
      const total121sFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_121s`]);
      }, 0);
      const totalCEUFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_ceu`]);
      }, 0);
      const totalPresentsFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_presents`]);
      }, 0);
      const totalSubstitutesFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_substitutes`]);
      }, 0);
      const totalLatesFiveMonths = [1, 2, 3, 4, 5].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_late`]);
      }, 0);


      const totalPresentsOneMonths = [1].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_presents`]);
      }, 0);
      const totalSubstitutesOneMonths = [1].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_substitutes`]);
      }, 0);
      const totalLatesOneMonths = [1].reduce((sum, i) => {
        return sum + parseIntSafe(member[`prior${i}_late`]);
      }, 0);

      const totalMeetingsFiveMonths = 21;
      const weeksInPeriodFiveMonths = 21;
      const weeksActiveFiveMonths = 21;
      const referralsPerWeekFiveMonths = weeksInPeriodFiveMonths ? totalReferralsFiveMonths / weeksInPeriodFiveMonths : 0;
      const visitorsPerWeekFiveMonths = weeksInPeriodFiveMonths ? totalVisitorsFiveMonths / weeksInPeriodFiveMonths : 0;
      const oneToOnesPerWeekFiveMonths = weeksInPeriodFiveMonths ? total121sFiveMonths / weeksInPeriodFiveMonths : 0;
      const ceuPerWeekFiveMonths = weeksInPeriodFiveMonths ? totalCEUFiveMonths / weeksInPeriodFiveMonths : 0;

      const attendancePointsFiveMonths = getAttendancePoints(totalPresentsFiveMonths, totalSubstitutesFiveMonths, totalLatesFiveMonths, totalMeetingsFiveMonths);

      const attendancePointsOneMonths = getAttendancePoints(totalPresentsOneMonths, totalSubstitutesOneMonths, totalLatesOneMonths, 4);
      const referralPointsFiveMonths = getReferralPoints(referralsPerWeekFiveMonths);
      const visitorPointsFiveMonths = getVisitorPoints(visitorsPerWeekFiveMonths);
      const oneToOnePointsFiveMonths = get121Points(oneToOnesPerWeekFiveMonths);
      const ceuPointsFiveMonths = getCEUPoints(ceuPerWeekFiveMonths);

      const totalScoreFiveMonths = attendancePointsFiveMonths + referralPointsFiveMonths + visitorPointsFiveMonths + oneToOnePointsFiveMonths + ceuPointsFiveMonths;

      const factor = Math.min(1, weeksActiveFiveMonths / 12); // Full expectations after 12 weeks
      const nextLevelScore = getTargetScore(currentLevel + 1);
      const greenLevelScore = 70 * factor;
      const pointsToNextLevel = nextLevelScore - totalScoreFiveMonths;

      // var attendancesNeeded = Number(getWednesdaysInMonth(inputFromSecondNode.one_back));
      var attendancesNeeded = Number(getWednesdaysInMonth('03/2025'));
      var ceusNeeded = Number(member['prior1_ceu']);
      var refNeeded = Number(member['prior1_referrals']);
      var visitorNeeded = Number(member['prior1_visitors']);
      var onetoneNeeded = Number(member['prior1_121s']);

      const improvementsNeeded = {
        pointsToNextLevel: pointsToNextLevel,
        toNextLevel: {
          attendance: attendancesNeeded,
          ceus: ceusNeeded,
          oneToOnes: onetoneNeeded,
          visitors: visitorNeeded,
          referrals: refNeeded,
        },
        toGreen: {
          attendance: attendancesNeeded,
          ceus: ceusNeeded,
          oneToOnes: onetoneNeeded,
          visitors: visitorNeeded,
          referrals: refNeeded,
        },
        toImprove: {
          attendance: attendancesNeeded,
          ceus: ceusNeeded,
          oneToOnes: onetoneNeeded,
          visitors: visitorNeeded,
          referrals: refNeeded,
        } // New category for Green level improvements
      };
      if (currentLevel != 4) {
        improvementsNeeded.toImprove = {};
      }
      if (currentLevel == 4) {
        improvementsNeeded.toNextLevel = {};
      }
      if (currentLevel == 4) {
        improvementsNeeded.toGreen = {};
      }
      if (pointsToNextLevel > 0 && currentLevel < 4) {
        let remainingPointsToAssign = pointsToNextLevel;

        // Calculate gaps and required actions for each category
        if (attendancePointsOneMonths < 20 && remainingPointsToAssign > 0) {
          const attendanceGapPoints = 20 - attendancePointsOneMonths;
          const pointsToAdd = Math.min(attendanceGapPoints, remainingPointsToAssign);

          // Calculate weeks per month (4 or 5 weeks)
          const weeksPerMonth = Math.ceil(weeksActiveFiveMonths / 6); // Dynamically adjusts for 4-5 week months
          const attendanceNeeded = Math.ceil((pointsToAdd / 20) * weeksPerMonth);

          var attendanceNeededUpdate = attendanceNeeded == 1 || attendanceNeeded == 2 || attendanceNeeded == 3 || attendanceNeeded == 4 ? 4 : 0;
          attendanceNeededUpdate = attendancesNeeded == 5 ? 5 : attendanceNeededUpdate;
          // Ensure we don't exceed practical limits (1 session per week)
          improvementsNeeded.toNextLevel.attendance = attendanceNeededUpdate;

          remainingPointsToAssign -= pointsToAdd;
        }
        if (ceuPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const ceuGapPoints = 20 - ceuPointsFiveMonths;
          const pointsToAdd = Math.min(ceuGapPoints, remainingPointsToAssign);

          // Calculate how many additional CEUs are needed
          // 1 per week = 20 points
          const ceusNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toNextLevel.ceus = Math.ceil(ceusNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }

        if (oneToOnePointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const oneToOneGapPoints = 20 - oneToOnePointsFiveMonths;
          const pointsToAdd = Math.min(oneToOneGapPoints, remainingPointsToAssign);

          // Calculate how many additional 1:1s are needed
          // 1 per week = 20 points
          const oneToOnesNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toNextLevel.oneToOnes = Math.ceil(oneToOnesNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }
        if (visitorPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const visitorGapPoints = 20 - visitorPointsFiveMonths;
          const pointsToAdd = Math.min(visitorGapPoints, remainingPointsToAssign);

          // Calculate how many additional visitors are needed
          // 0.25 per week = 20 points
          const visitorsNeeded = (pointsToAdd / 20) * 0.25 * weeksInPeriod;
          improvementsNeeded.toNextLevel.visitors = Math.ceil(visitorsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }


        if (referralPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const referralGapPoints = 20 - referralPointsFiveMonths;
          const pointsToAdd = Math.min(referralGapPoints, remainingPointsToAssign);

          // Calculate how many additional referrals are needed
          // 1 per week = 20 points, so 1 referral = 20/weeksInPeriod points
          const referralsNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toNextLevel.referrals = Math.ceil(referralsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }


      }

      const pointsToGreen = greenLevelScore - totalScoreFiveMonths;
      if (pointsToGreen > 0 && currentLevel < 4) {
        let remainingPointsToAssign = pointsToGreen;

        // Calculate gaps and required actions for each category
        if (attendancePointsOneMonths < 20 && remainingPointsToAssign > 0) {
          const attendanceGapPoints = 20 - attendancePointsOneMonths;
          const pointsToAdd = Math.min(attendanceGapPoints, remainingPointsToAssign);

          // Calculate weeks per month (4 or 5 weeks)
          const weeksPerMonth = Math.ceil(weeksActiveFiveMonths / 6); // Dynamically adjusts for 4-5 week months
          const attendanceNeeded = Math.ceil((pointsToAdd / 20) * weeksPerMonth);

          var attendanceNeededUpdate = attendanceNeeded == 1 || attendanceNeeded == 2 || attendanceNeeded == 3 || attendanceNeeded == 4 ? 4 : 0;
          attendanceNeededUpdate = attendancesNeeded == 5 ? 5 : attendanceNeededUpdate;
          // Ensure we don't exceed practical limits (1 session per week)
          improvementsNeeded.toNextLevel.attendance = attendanceNeededUpdate;

          remainingPointsToAssign -= pointsToAdd;
        }
        if (ceuPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const ceuGapPoints = 20 - ceuPointsFiveMonths;
          const pointsToAdd = Math.min(ceuGapPoints, remainingPointsToAssign);

          // Calculate how many additional CEUs are needed
          // 1 per week = 20 points
          const ceusNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toGreen.ceus = Math.ceil(ceusNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }
        if (oneToOnePointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const oneToOneGapPoints = 20 - oneToOnePointsFiveMonths;
          const pointsToAdd = Math.min(oneToOneGapPoints, remainingPointsToAssign);

          // Calculate how many additional 1:1s are needed
          // 1 per week = 20 points
          const oneToOnesNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toGreen.oneToOnes = Math.ceil(oneToOnesNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }


        if (visitorPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const visitorGapPoints = 20 - visitorPointsFiveMonths;
          const pointsToAdd = Math.min(visitorGapPoints, remainingPointsToAssign);

          // Calculate how many additional visitors are needed
          // 0.25 per week = 20 points
          const visitorsNeeded = (pointsToAdd / 20) * 0.25 * weeksInPeriod;
          improvementsNeeded.toGreen.visitors = Math.ceil(visitorsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }
        if (referralPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const referralGapPoints = 20 - referralPointsFiveMonths;
          const pointsToAdd = Math.min(referralGapPoints, remainingPointsToAssign);

          // Calculate how many additional referrals are needed
          // 1 per week = 20 points, so 1 referral = 20/weeksInPeriod points
          const referralsNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toGreen.referrals = Math.ceil(referralsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }
      }

      // For Green level members
      if (currentLevel === 4) {
        let remainingPointsToAssign = 100 - totalScoreFiveMonths;

        // Calculate gaps and required actions for each category
        if (attendancePointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const attendanceGapPoints = 20 - attendancePointsFiveMonths; // 5 points needed
          const pointsToAdd = Math.min(attendanceGapPoints, remainingPointsToAssign); // min(5, 10) = 5
          const attendanceNeeded = pointsToAdd * (5 / 20); // 5 * 0.25 = 1.25

          // Round to nearest whole number since attendance is typically whole units
          improvementsNeeded.toImprove.attendance = Math.round(attendanceNeeded); // 1
          remainingPointsToAssign -= pointsToAdd; // 10 - 5 = 5
        }

        if (referralPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const referralGapPoints = 20 - referralPointsFiveMonths;
          const pointsToAdd = Math.min(referralGapPoints, remainingPointsToAssign);

          // Calculate how many additional referrals are needed
          // 1 per week = 20 points, so 1 referral = 20/weeksInPeriod points
          const referralsNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toImprove.referrals = Math.ceil(referralsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }

        if (visitorPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const visitorGapPoints = 20 - visitorPointsFiveMonths;
          const pointsToAdd = Math.min(visitorGapPoints, remainingPointsToAssign);

          // Calculate how many additional visitors are needed
          // 0.25 per week = 20 points
          const visitorsNeeded = (pointsToAdd / 20) * 0.25 * weeksInPeriod;
          improvementsNeeded.toImprove.visitors = Math.ceil(visitorsNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }

        if (oneToOnePointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const oneToOneGapPoints = 20 - oneToOnePointsFiveMonths;
          const pointsToAdd = Math.min(oneToOneGapPoints, remainingPointsToAssign);

          // Calculate how many additional 1:1s are needed
          // 1 per week = 20 points
          const oneToOnesNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toImprove.oneToOnes = Math.ceil(oneToOnesNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }

        if (ceuPointsFiveMonths < 20 && remainingPointsToAssign > 0) {
          const ceuGapPoints = 20 - ceuPointsFiveMonths;
          const pointsToAdd = Math.min(ceuGapPoints, remainingPointsToAssign);

          // Calculate how many additional CEUs are needed
          // 1 per week = 20 points
          const ceusNeeded = (pointsToAdd / 20) * weeksInPeriod;
          improvementsNeeded.toImprove.ceus = Math.ceil(ceusNeeded);
          remainingPointsToAssign -= pointsToAdd;
        }
      }

      return improvementsNeeded;
    };

    const improvements = calculateImprovementsNeeded(totalScore, currentLevel, weeksActive);

    const getLevelName = (level) => {
      switch (level) {
        case 4: return 'Green';
        case 3: return 'Yellow';
        case 2: return 'Red';
        default: return 'Grey';
      }
    };

    // Calculate previous month stats for comparison
    const previousMonthStats = {
      referrals: parseIntSafe(member['prior2_referrals']),
      visitors: parseIntSafe(member['prior2_visitors']),
      oneToOnes: parseIntSafe(member['prior2_121s']),
      ceu: parseIntSafe(member['prior2_ceu']),
      presents: parseIntSafe(member['prior2_presents']),
      substitutes: parseIntSafe(member['prior2_substitutes']),
      late: parseIntSafe(member['prior2_late'])
    };

    // Calculate current month stats
    const currentMonthStats = {
      RGI: parseIntSafe(member['prior1_RGI']),
      RGO: parseIntSafe(member['prior1_RGO']),
      referrals: parseIntSafe(member['prior1_referrals']),
      visitors: parseIntSafe(member['prior1_visitors']),
      oneToOnes: parseIntSafe(member['prior1_121s']),
      ceu: parseIntSafe(member['prior1_ceu']),
      presents: parseIntSafe(member['prior1_presents']),
      substitutes: parseIntSafe(member['prior1_substitutes']),
      late: parseIntSafe(member['prior1_late'])
    };

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      // Handle division by zero and NaN cases
      if (previous === 0) {
        return current > 0 ? 100 : 0; // If previous is 0 and current is positive, that's a 100% increase
      }
      return ((current - previous) / previous) * 100;
    };

    // Calculate effective attendance for both months
    const previousEffectivePresents = previousMonthStats.presents +
      (previousMonthStats.substitutes * 0.5) +
      (previousMonthStats.late * 0.5);

    const currentEffectivePresents = currentMonthStats.presents +
      (currentMonthStats.substitutes * 0.5) +
      (currentMonthStats.late * 0.5);

    // Fixed meeting count per month (typically 4 or 5)
    const meetingsPerMonth = 4;

    // Calculate attendance percentage for both months
    const previousAttendanceRate = previousEffectivePresents / meetingsPerMonth;
    const currentAttendanceRate = currentEffectivePresents / meetingsPerMonth;

    // Calculate percentage changes
    const percentageChanges = {
      referrals: calculatePercentageChange(currentMonthStats.referrals, previousMonthStats.referrals),
      visitors: calculatePercentageChange(currentMonthStats.visitors, previousMonthStats.visitors),
      oneToOnes: calculatePercentageChange(currentMonthStats.oneToOnes, previousMonthStats.oneToOnes),
      ceu: calculatePercentageChange(currentMonthStats.ceu, previousMonthStats.ceu),
      attendance: calculatePercentageChange(currentAttendanceRate, previousAttendanceRate)
    };

    return {
      memberName: member.member_name,
      powerTeam: member['Power Team'],
      currentScore: parseInt(totalScore.toFixed(0)),
      currentLevel: currentLevel,
      nextLevel: nextLevel,
      levelName: getLevelName(currentLevel),
      nextLevelName: getLevelName(nextLevel),
      currentMetrics: {
        totalOfAllSixMonths: {
          totalReferrals: totalReferrals,
          totalVisitors: totalVisitors,
          total121s: total121s,
          totalCEU: totalCEU,
          totalPresents: totalPresents,
          totalMedicalsLeaves: totalMedicalsLeaves,
          totalSubstitutes: totalSubstitutes,
          totalLates: totalLates,
          totalReferralsRecieved: totalReferralsRecieved,
          totalReferralsSend: totalReferralsSend,
        },
        getLastMonth: getLastMonthSheets,
        currentDate: currentDate,
        startDate: startDate,
        startDate: member["Recent Start Date"],
        weeksActive: weeksActive,
        weeksInPeriod: weeksInPeriod,
        totalMeetings: totalMeetings,
        attendancePoints: attendancePoints,
        referralsPerWeek: referralsPerWeek.toFixed(2),
        visitorsPerWeek: visitorsPerWeek.toFixed(2),
        oneToOnesPerWeek: oneToOnesPerWeek.toFixed(2),
        ceuPerWeek: ceuPerWeek.toFixed(2),
        totalCEU: totalCEU,
        attendance: attendance
      },
      currentPoints: {
        member_join_date: member["Recent Start Date"],
        adjustedStartDateNewUser: adjustedStartDateNewUser,
        adjustedStartDate: adjustedStartDate,
        attendance: attendancePoints,
        referrals: referralPoints,
        visitors: visitorPoints,
        oneToOnes: oneToOnePoints,
        ceus: ceuPoints
      },
      improvementsNeeded: improvements,
      percentageChanges: {
        referrals: parseFloat(percentageChanges.referrals.toFixed(2)),
        visitors: parseFloat(percentageChanges.visitors.toFixed(2)),
        oneToOnes: parseFloat(percentageChanges.oneToOnes.toFixed(2)),
        ceu: parseFloat(percentageChanges.ceu.toFixed(2)),
        attendance: parseFloat(percentageChanges.attendance.toFixed(2))
      },

      previousMonth: previousMonthStats,
      currentMonth: currentMonthStats
    };
  };
  function transformSheetData(data, number) {
    // Validate input
    //if (!Array.isArray(data) return [];
    if (data.length < 2) return []; // Need at least headers + one row

    // Get headers with duplicate protection
    const headers = data[0].map((header, index) => {
      // Handle empty headers and ensure uniqueness
      const baseName = (header || '').trim() || `column_${index + 1}`;
      let uniqueName = baseName;
      let counter = 1;

      // Ensure header name is unique
      while (data[0].slice(0, index).includes(uniqueName)) {
        uniqueName = `${baseName}_${counter}`;
        counter++;
      }

      return uniqueName;
    });

    // Transform rows to objects without duplicates
    var result = [];
    const seen = new Set(); // Track unique rows

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};

      // Create object with headers as keys
      headers.forEach((header, index) => {
        obj[header] = row[index] ?? ''; // Nullish coalescing
      });

      // Create a unique identifier for the row
      const rowKey = JSON.stringify(obj);

      // Only add if not already seen
      if (!seen.has(rowKey)) {
        seen.add(rowKey);
        result.push(obj);
      }
    }
    var new_arr = [];
    var arrange = 'prior' + number + '_';
    result.forEach(element => {
      var newData = {
        "Member Name": element['First Name'] + ' ' + element['Last Name'],
        "Power Team": "Health & Wellness",
        "Recent Start Date": "1/1/2021",
        "member_name": element['First Name'] + ' ' + element['Last Name'],
        [arrange + "referrals"]: Number(element['RGI'] + element['RGO']),
        [arrange + "visitors"]: element['V'],
        [arrange + "121s"]: element['1-2-2001'],
        [arrange + "ceu"]: element['CEU'],
        [arrange + "substitutes"]: element['S'],
        [arrange + "presents"]: element['P'],
        [arrange + "absents"]: element['A'],
        [arrange + "referrals_recieved"]: element['RGI'],
        [arrange + "late"]: element['L'],
        [arrange + "TYFCB"]: element['TYFCB'],
        [arrange + "RGI"]: element['RGI'],
        [arrange + "RGO"]: element['RGO'],
        [arrange + "RRI"]: element['RRI'],
        [arrange + "RRO"]: element['RRO'],
        [arrange + "Medical"]: element['M'],
      }
      new_arr.push(newData);
    });
    result = new_arr;
    return result;
  }
  const getDataSheets = async () => {
    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=march 2025!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setOne_month(transformSheetData(data.values, 1)));

    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=febrary 2025!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setTwo_month(transformSheetData(data.values, 2)));


    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=january 2025!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setThree_month(transformSheetData(data.values, 3)));

    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=december 2024!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setFour_month(transformSheetData(data.values, 4)));

    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=november 2024!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setFive_month(transformSheetData(data.values, 5)));

    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + SHEET_ID + '&range=october 2024!A9:P', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setSix_month(transformSheetData(data.values, 6)));
    var member_sheet = '1GSGm6mmkyVo88iOaPTJylVUKwGQFvwp6s_ZM_OYzZHw'
    await fetch('http://localhost:3001/api/sheets?spreadsheetId=' + member_sheet + '&range=Member Pulse Checks!A2:D', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

    }).then(res => res.json())
      .then(data => setMember_joing_data(data.values));

    //  https://docs.google.com/spreadsheets/d/1GSGm6mmkyVo88iOaPTJylVUKwGQFvwp6s_ZM_OYzZHw/edit?usp=sharing
    //setMember_joing_data
  }
  function mergeAllMembers(monthlyArrays) {
    const memberMap = {};

    monthlyArrays.forEach((monthData, monthIndex) => {
      const monthNumber = monthIndex + 1;

      monthData.forEach(member => {
        const memberKey = member.member_name;

        if (!memberMap[memberKey]) {
          // Initialize with shared info
          memberMap[memberKey] = {
            "Member Name": member["Member Name"],
            "Power Team": member["Power Team"],
            "Recent Start Date": member["Recent Start Date"],
            "member_name": member["member_name"]
          };
        }

        for (const key in member) {
          if (!["Member Name", "Power Team", "Recent Start Date", "member_name"].includes(key)) {
            const metric = key.replace(/^prior\d+_/, ''); // remove prior prefix if exists
            memberMap[memberKey][`prior${monthNumber}_${metric}`] = member[key];
          }
        }
      });
    });

    return Object.values(memberMap);
  }

  const showData = async () => {
    fetch('https://roilevelup.app.n8n.cloud/webhook/members-reading')
      .then(res => res.json())
      .then(data => {
        console.log('Data from n8n:', data);
      })
      .catch(err => console.error('Fetch error:', err));
    return
    const Complete_data_six_months = mergeAllMembers([
      one_month, two_month, three_month,
      four_month, five_month, six_month
    ]);


    // update the recent start date also
    member_joing_data.forEach(row => {
      const [name, , , newStartDate] = row;
      const cleanName = name.trim().toLowerCase();

      Complete_data_six_months.forEach(member => {
        const memberName = member["Member Name"].trim().toLowerCase();

        if (memberName === cleanName) {
          member["Recent Start Date"] = newStartDate;
        }
      });
    });


    //  console.log(Complete_data_six_months);
    var all_cal = [];
    Complete_data_six_months.forEach(element => {
      all_cal.push(calculateStats(element))
    });
    setAfter_six_month_calculations(all_cal)
    console.log(all_cal);
    setSelectedMember(all_cal[0]);
    //all_cal.improvementsNeeded

    // const [formData, setFormData] = useState({
    //   projections: "Next Level",
    //   present: "",
    //   late: false,
    //   substitutes: false,
    //   medical: false,
    //   rgo: false,
    //   rgi: false,
    //   one2ones: false,
    //   ceus: false,
    //   visitors: false,
    // });

  }
  const handleSubmit = async () => {
  }
  const handleChange = async (event) => {
    const value = event.target.value;
    after_six_month_calculations.forEach(element => {
      if (element.memberName == value) {
        setSelectedMember(element);
        console.log(element)
      }
    });


  }

  useEffect(() => {

  }, []);
  const handleChangeFormdata = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "number" ? parseInt(value || "0") : value,
    }));
  };
  return (
    <>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {/* <h2>Please Enter Sheets</h2> */}
        <form onSubmit={handleSubmit}>
          {/* <div>
            <label>Sheet Name (1):</label><br />
            <input
              type="text"
              name="name2"
              value={sheet_name1}
              onChange={(e) => setSheet_name1(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (1):</label><br />
            <input
              type="text"
              name="id2"
              value={sheet_id1}
              onChange={(e) => setSheet_id1(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet Name (2):</label><br />
            <input
              type="text"
              name="name3"
              value={sheet_name2}
              onChange={(e) => setSheet_name2(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (2):</label><br />
            <input
              type="text"
              name="id3"
              value={sheet_id2}
              onChange={(e) => setSheet_id2(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet Name (3):</label><br />
            <input
              type="text"
              name="name4"
              value={sheet_name3}
              onChange={(e) => setSheet_name3(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (3):</label><br />
            <input
              type="text"
              name="id4"
              value={sheet_id3}
              onChange={(e) => setSheet_id3(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet Name (4):</label><br />
            <input
              type="text"
              name="name5"
              value={sheet_name4}
              onChange={(e) => setSheet_name4(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (4):</label><br />
            <input
              type="text"
              name="id5"
              value={sheet_id4}
              onChange={(e) => setSheet_id4(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet Name (5):</label><br />
            <input
              type="text"
              name="name6"
              value={sheet_name5}
              onChange={(e) => setSheet_name5(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (5):</label><br />
            <input
              type="text"
              name="id7"
              value={sheet_id5}
              onChange={(e) => setSheet_id5(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet Name (6):</label><br />
            <input
              type="text"
              name="name8"
              value={sheet_name6}
              onChange={(e) => setSheet_name6(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Sheet ID (6):</label><br />
            <input
              type="text"
              name="id8"
              value={sheet_id6}
              onChange={(e) => setSheet_id6(e.target.value)}
              required
            />
          </div> */}

          {/* <button type="button" className="cancel-button" onClick={() => { getDataSheets() }}>
            Get Sheets Data
          </button> */}
        </form>
        {six_month.length != 0 &&
          <button type="button" className="cancel-button" onClick={() => { showData() }}>
            show data
          </button>}
      </div>

      <div className="min-h-screen bg-red-700 p-6">
        <div className="bg-white max-w-6xl mx-auto rounded-2xl p-6 shadow-lg">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
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
          </div>
          {selectedMember &&
            <>
              {activeTab === 'current' ? (
                // Current tab content
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-xl text-left">
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">October - April's Performance</span>{' '}
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
                      <p className="font-bold">April’s Performance</p>
                      <p className="text-blue-700">⬆️ 10 points from last month</p>

                      <div>
                        <p className="font-semibold">Attendance</p>
                        <p>Present</p>
                        <p>{selectedMember?.currentMonth?.presents} of {Number(getWednesdaysInMonth('03/2025'))}</p>
                      </div>

                      <div>
                        <p className="font-semibold">Referrals</p>
                        <p>RGO: {selectedMember?.currentMonth?.RGO ? selectedMember?.currentMonth?.RGO : 0} ⬆️ 10</p>
                        <p>RGI: {selectedMember?.currentMonth?.RGI ? selectedMember?.currentMonth?.RGI : 0} ⬆️ 10</p>
                      </div>

                      <div>
                        <p className="font-semibold">1-2-1s</p>
                        <p>{selectedMember?.currentMonth?.oneToOnes ? selectedMember?.currentMonth?.oneToOnes : 0} ⬆️ 10</p>
                      </div>

                      <div>
                        <p className="font-semibold">CEUs</p>
                        <p>{selectedMember?.currentMonth?.ceu ? selectedMember?.currentMonth?.ceu : 0} ⬆️ 10</p>
                      </div>

                      <div>
                        <p className="font-semibold">Visitors</p>
                        <p>{selectedMember?.currentMonth?.visitors ? selectedMember?.currentMonth?.visitors : 0} ⬆️ 10</p>
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
                // Level Up tab content
                // <div className="text-center text-gray-600 text-xl p-10">
                //   🚀 <strong>Level Up</strong> content goes here (under construction or dynamic).
                // </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm w-full">
                  <div className="lg:col-span-1">
                    <h2 className="font-semibold text-lg mb-1 text-gray-800">November - May’s Forecast</h2>
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

                    <label className="block font-medium text-gray-700 mb-1">May’s Projections</label>
                    <select
                      name="projections"
                      value={formData.projections}
                      onChange={handleChangeFormdata}
                      className="border p-2 w-full rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Next Level">Next Level</option>
                      <option value="Green">Green</option>
                      <option value="Maximum">Maximum</option>
                      <option value="Custom">Custom</option>
                    </select>

                    <div className="mt-4">
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
                        />
                        <span className="text-gray-600" >of 5</span>
                      </div>
                      {["late", "substitutes", "medical"].map((field) => (
                        <div className="mt-4" key={field}>
                          <label className="text-gray-700 block mb-1 capitalize" style={{ textAlign: 'left' }}>{field}</label>
                          <input
                            type="number"
                            name={field}
                            value={formData[field]}
                            style={{ maxWidth: '74px', textAlign: 'left' }}
                            onChange={handleChangeFormdata}
                            className="border rounded w-16 p-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block font-medium text-gray-700 mb-1" style={{ textAlign: 'left' }}>Referrals</label>
                      {["rgo", "rgi"].map((field) => (
                        <div className="mb-2" key={field}>
                          <label className="text-gray-700 block mb-1 uppercase" style={{ textAlign: 'left' }}>{field}</label>
                          <input
                            type="number"
                            name={field}
                            style={{ maxWidth: '74px' }}
                            value={formData[field]}
                            onChange={handleChangeFormdata}
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      {["one2ones", "ceus", "visitors"].map((field) => (
                        <div className="mb-2" key={field}>
                          <label className="text-gray-700 block mb-1 uppercase" style={{ textAlign: 'left' }}>{field}</label>
                          <input
                            type="number"
                            name={field}
                            style={{ maxWidth: '74px' }}
                            value={formData[field]}
                            onChange={handleChangeFormdata}
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-rows-2 gap-6">
                    <div className="bg-gray-300 h-48 rounded" />
                    <div className="bg-gray-300 h-48 rounded" />
                  </div>
                </div>
              )}</>}
        </div>
      </div>

    </>
  )
}

export default old_app
