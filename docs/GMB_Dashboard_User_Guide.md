# GMB Land Policy Dashboard User Guide

## 1. What This Dashboard Is For

This dashboard helps compare how different land rent policy options affect Gujarat Maritime Board revenue.

It is meant to answer practical questions such as:

- How much revenue is GMB earning at present?
- What happens if current SoPC rates are continued or revised?
- What happens under policy Option 1 to Option 6?
- Which ports, land types, or plots contribute most to revenue?
- Which option gives more revenue to GMB and which option gives relief to the lessee?
- How does the result change if WPI, market value, slab percentage, or other assumptions are changed?
- What is the projected revenue over the next 30 years?
- What happens to LPA plots during the remaining lease period and after lease expiry?

The dashboard is not only a data table. It is a decision-support tool. It lets the user change assumptions and immediately see the effect on revenue, plot-level rent, percentage change, and long-term projection.

## 2. Main Idea In Simple Words

Each plot has basic details such as port, land type, area, lease period, existing rent, and valuation details.

The dashboard compares existing rent with different policy scenarios:

- SoPC Current
- SoPC Revised
- Option 1
- Option 2
- Option 3
- Option 4
- Option 5
- Option 6

For every plot, the dashboard calculates what rent would apply under each scenario. It then totals those results by land type, by port group, and for the whole dashboard.

When a control panel setting is changed, the dashboard recalculates the results automatically.

## 3. Login And Saving

The dashboard opens with a password screen.

After login, the dashboard loads:

- The built-in plot data from the app
- Any saved control panel settings from JSONBin
- Any saved plot edits from JSONBin

Plot edits and control panel changes are saved automatically. After changing a value, wait a few seconds and check the save status in the top-right area. When it shows Saved, the change has been stored.

To keep JSONBin size small, the app does not upload the full hardcoded plot database every time. It saves:

- Control panel settings
- Only the plot details that were changed, added, or deleted

## 4. The Two Main Screens

The dashboard has two main tabs.

## 4.1 Revenue Overview

This is the summary screen.

Use this screen when you want a high-level answer without checking each plot one by one.

It shows:

- Current total revenue
- Revenue under each policy scenario
- Difference between existing rent and proposed scenario rent
- Which options increase GMB revenue
- Which options reduce revenue or give relief
- Revenue split by land type
- 30-year projection for all scenarios

This screen is useful for policy discussion, presentations, and quick comparison.

## 4.2 Detailed Matrix

This is the plot-wise screen.

Use this screen when you want to inspect individual plots.

It shows each plot row with:

- Plot or lessee name
- Port
- Land type
- Area
- Lease expiry
- Status
- Existing rent
- Rent under each scenario
- Percentage change under each scenario

Color meaning:

- Blue shows existing/current rent reference
- Green percentage means GMB earns more than existing
- Red percentage means GMB earns less or the lessee gets relief

Clicking a row opens the plot detail popup.

## 5. Plot Detail Popup

The plot detail popup gives a deeper view of one plot.

It shows:

- Basic plot information
- Existing rent
- Scenario-wise rent
- Difference from existing rent
- Percentage change
- IRR values
- 30-year revenue projection for that plot

This is useful when a specific plot needs explanation, checking, or editing.

The popup also has an edit option. If plot details are edited, the change is saved to JSONBin.

## 6. Land Types Used In The Dashboard

The dashboard separates land into broad categories.

## 6.1 SoPC Ordinary Land

SoPC plots use SoPC rates. The dashboard compares the current SoPC rate and revised SoPC rate.

In long-term projection, SoPC revenue can increase every year based on the WPI percentage entered in the control panel.

## 6.2 LPA Firm Land

LPA plots follow lease agreement logic.

For LPA plots, the dashboard now treats the lease period carefully:

- During the existing lease period, rent follows the lease contract escalation.
- Policy Option 1 to Option 6 does not immediately replace the contract rent during the active lease.
- After lease expiry, the selected policy option starts applying.

This is important because it avoids showing a policy rent too early while the existing lease is still active.

## 6.3 Reclaimed Land

Reclaimed land can be treated as a percentage of firm land rent.

The dashboard also allows rebate logic for reclaimed land, where rent can be reduced for a defined rebate period.

## 7. Scenario Meaning

## 7.1 SoPC Current

This uses the present SoPC rate entered in the control panel.

It answers: what revenue is expected if the current SoPC rate is applied?

## 7.2 SoPC Revised

This uses the revised SoPC rate entered in the control panel.

It answers: what revenue is expected if the revised SoPC rate is applied?

## 7.3 Option 1: Fresh Valuation

This option uses port valuation, fresh valuation percentage, slab factor, and utilization factor.

In simple words, it estimates rent based on land value and selected policy percentage.

It is sensitive to:

- Port valuation
- Fresh valuation percentage
- Area slab
- Utilization factor

## 7.4 Option 2: 40 Percent Factor

This is similar to Option 1, but applies a 40 percent factor before the fresh valuation calculation.

It generally produces a lower number than Option 1 because only 40 percent of the value base is considered before applying the percentage.

## 7.5 Option 3: Continue Existing

This continues the existing rent.

It is useful as a baseline or conservative option.

## 7.6 Option 4: Existing Rent Plus WPI

This starts from existing rent and applies WPI.

It answers: what if rent is updated using inflation/WPI logic?

## 7.7 Option 5: 50 Percent Hike

This increases existing rent by 50 percent.

It is a simple increase option and is easy to explain.

## 7.8 Option 6: Block Method

This applies a step-up block structure.

The user can define:

- How much rent increases in each block
- How many years each block lasts
- How many blocks are considered

In the dashboard, Option 6 is marked as the recommended option.

## 8. Control Panel Guide

The control panel is where assumptions are changed.

Changing these settings does not permanently change the original hardcoded plot database. It changes the calculation assumptions and saves the selected settings to JSONBin.

## 8.1 A: SoPC Rates

This section controls SoPC rent calculations.

Current rate:

This is the present SoPC rate per 10 square metres.

Revised rate:

This is the proposed or revised SoPC rate per 10 square metres.

Projection WPI percent:

This is used for the 30-year SoPC projection. If the user enters 5 percent, the projected SoPC revenue grows by 5 percent each year.

Use this when discussing long-term expected revenue, not just current-year revenue.

## 8.2 B: Port Valuations

This section contains market value assumptions for each port.

These values affect Option 1 and Option 2 because those options are linked to land value.

If a port valuation is increased:

- Option 1 rent for plots in that port generally increases
- Option 2 rent for plots in that port generally increases
- Total projected revenue can increase

If a port valuation is reduced, the opposite happens.

## 8.3 C: Slab Configuration

This section controls how plot size affects the calculation.

Large plots may not be charged at the same percentage as smaller plots. The slab settings allow the dashboard to apply different percentage factors based on area size.

In simple words:

- Smaller plots may get one factor
- Medium plots may get another factor
- Large plots may get another factor

This helps avoid treating every plot the same when area size is very different.

## 8.4 D: Fresh Valuation Percent

This controls the percentage used in Option 1 and Option 2.

If the fresh valuation percentage is increased:

- Option 1 increases
- Option 2 increases
- Revenue under those options increases

If it is reduced, those options reduce.

Use this section when testing different policy percentages.

## 8.5 E: Escalation

This section controls escalation assumptions for options that depend on rent increase logic.

WPI rate:

Used where the option applies WPI-based increase.

Escalation percent and every N years:

Used where rent is increased by a fixed percentage after a fixed number of years.

For example, 10 percent every 3 years means rent steps up after every 3-year block.

For LPA plots, contract escalation is considered during the lease period. After lease expiry, policy scenario logic applies.

## 8.6 F: Option 6 Block Settings

This controls the block method used for Option 6.

Block step-up percent:

How much the rent increases in each block.

Block duration:

How many years one block lasts.

Number of blocks:

How many blocks are considered.

This section is useful when testing long-term policy structures such as gradual increases instead of one immediate jump.

## 8.7 G: Reclaimed Land

This controls how reclaimed land rent is treated.

Percent of firm land rent:

This says reclaimed land rent should be treated as a percentage of normal firm land rent.

Rebate period:

This defines how many years rebate continues.

Rebate sub-discount:

This defines the discount during the rebate period.

Use this section when reclaimed land needs different treatment from regular firm land.

## 8.8 H: Holdover And Penalty

This section controls what happens when a lease has expired but the occupant continues.

If holdover is enabled, the dashboard can apply a penalty multiplier to expired leases.

Penalty multiplier:

If the multiplier is 3, the dashboard treats the rent as 3 times the base amount for holdover cases.

Use this when evaluating stricter treatment for expired leases.

## 8.9 I: IRR Settings

This section controls the IRR calculation view.

Horizon:

How many years are considered for IRR.

Residual value at horizon:

The value assumed at the end of the calculation period.

IRR is a return indicator. It is useful for comparing how strong or weak a rent scenario looks when treated like a financial return over time.

For general revenue policy discussion, total rent and percentage change may be easier to understand than IRR.

## 9. Understanding Existing Rent

Existing rent is the current/reference rent used for comparison.

For normal SoPC plots, existing rent is shown based on the data in the dashboard.

For LPA plots, existing rent now reflects lease escalation logic. That means it should not stay stuck at only the initial rent if the lease says rent escalates over time.

This makes the comparison more realistic because policy options are compared against the current escalated lease position, not only the starting rent.

## 10. Understanding LPA Lease Logic

This is one of the most important parts.

For active LPA leases:

- The dashboard keeps rent as per existing lease during the contract period.
- Option 1 to Option 6 are not applied immediately during the active lease.
- After lease expiry, the policy option conditions apply.

For expired LPA leases:

- The dashboard can apply policy scenario rent.
- If holdover penalty is enabled, expired cases may show penalty effect.

This helps separate two questions:

- What is payable during the existing lease?
- What should happen after the lease ends?

## 11. Understanding 30-Year Projection

The 30-year projection shows expected revenue year by year.

It helps answer:

- What is the long-term revenue under each option?
- Which option gives better cumulative revenue?
- How much difference appears over time?

For SoPC scenarios:

- The dashboard applies the Projection WPI percent from the control panel.
- This means SoPC revenue does not remain flat for all 30 years unless WPI is set to 0.

For LPA scenarios:

- During active lease years, rent follows lease logic.
- After lease expiry, the selected policy scenario starts applying.

The 30-year cumulative row shows total revenue over the full 30-year period.

## 12. Understanding Plot Editing

When opening a plot detail and selecting edit, the user can change plot-level information such as:

- Port
- Land type
- Area
- Lease start
- Lease term
- Existing rent
- Acquisition cost
- Individual valuation
- Reclamation year
- Notes

Any plot edit affects calculations for that plot and the totals where that plot is included.

After editing, wait for the save status to show Saved.

## 13. Practical Use Cases

## 13.1 Policy Comparison Meeting

Use the Revenue Overview tab.

Compare total revenue under each scenario. Then use the 30-year projection to show how small annual assumptions can become large over time.

## 13.2 Checking One Lessee Or Plot

Use the Detailed Matrix tab.

Search or browse to the plot, click the row, and review the popup.

Check:

- Existing rent
- Scenario rent
- Percentage increase or decrease
- Lease expiry
- 30-year projection

## 13.3 Testing A New SoPC Rate

Open control panel section A.

Change revised SoPC rate. Then check:

- SoPC Revised column
- Revenue Overview totals
- 30-year projection

## 13.4 Testing Inflation/WPI Impact

For SoPC projection, change Projection WPI percent in section A.

For WPI-based rent option, change WPI Rate in section E.

Then compare 30-year revenue.

## 13.5 Testing Market Value Impact

Open section B and change the port valuation.

Then check Option 1 and Option 2 because those options are most affected by port valuation.

## 13.6 Testing Treatment For Expired Leases

Open section H.

Enable holdover/penalty and adjust the multiplier.

Then check expired plots and total revenue impact.

## 14. How To Read The Dashboard Safely

Use the dashboard as a comparison and decision-support tool.

Important points:

- A higher revenue option is not automatically the best policy option.
- A lower revenue option may represent relief or smoother implementation.
- LPA plots must be understood with lease expiry dates.
- SoPC long-term projection depends strongly on WPI assumption.
- Port valuation changes can significantly affect Option 1 and Option 2.
- IRR is useful, but for non-finance discussion, rent and total revenue are usually easier to explain.

## 15. Quick Checklist For Users

Before using the dashboard for discussion:

1. Confirm data is loaded and plot count is visible.
2. Confirm save status is not showing an error.
3. Review SoPC current and revised rates.
4. Review Projection WPI percent.
5. Review port valuation assumptions if Option 1 or Option 2 are being discussed.
6. Review LPA lease expiry dates for important plots.
7. Use Revenue Overview for summary.
8. Use Detailed Matrix for plot-wise explanation.
9. Click plot rows for detailed popup.
10. Wait for Saved status after making changes.

## 16. Simple Explanation For Presenting The Dashboard

This dashboard compares existing land rent with multiple policy options. It shows how each option affects GMB revenue at plot level, land-type level, and overall level. It also shows long-term 30-year revenue projection. Control panel settings allow the user to test different assumptions such as SoPC rate, WPI, port valuation, slab factor, reclaimed land rebate, penalty for expired leases, and IRR horizon. The purpose is to support policy discussion by showing the revenue effect of each option clearly and quickly.
