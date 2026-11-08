\# K-POP IDOL TYCOON

\## Comprehensive Game Development Master Prompt for Google AI Studio



You are an expert game developer, React engineer, UI/UX designer, and simulation game systems designer.



Your task is to develop a fully functional, text-based K-pop entertainment company management simulator called \*\*K-pop Idol Tycoon\*\*.



The game is inspired by management and life simulation games such as BitLife, Idol Producer, and Monthly Entertainment.



I want you to build an actual playable game, not merely a visual prototype, a landing page, or a collection of disconnected screens.



The game must have interconnected management systems, meaningful player decisions, persistent progression, functional buttons, realistic resource management, and a polished pixel-inspired interface.



Follow this specification carefully.



If a feature is not explicitly defined, make a reasonable design decision that is consistent with the existing game systems. Avoid unnecessarily complicated mechanics in the initial version.



\---



\# 1. PROJECT OVERVIEW



\## Game identity



Game title: K-pop Idol Tycoon



Genre:

\- Idol management simulation

\- Entertainment company management

\- Text-based simulation

\- Business management

\- Progression and resource management



Platform:

\- Desktop-first responsive web application

\- React

\- JavaScript or TypeScript

\- HTML and CSS



Hosting:

\- GitHub Pages



Game requirements:

\- Completely offline after the application has been loaded.

\- No backend server.

\- No account registration.

\- No external AI API.

\- No online dependency for gameplay.

\- Persistent local game saves.

\- Procedurally generated idols, events, news, and other content.

\- Pixel-inspired graphics and retro management game aesthetics.



The game should remain playable without an internet connection after its assets have been loaded.



Do not introduce online services, external APIs, authentication, or server-side dependencies.



\## Core gameplay



The player creates an entertainment company and develops it from a small local agency into a worldwide entertainment company.



The player manages:



\- Company finances

\- Company reputation

\- Company upgrades

\- Idol auditions

\- Idol recruitment

\- Idol training

\- Idol contracts

\- Group formation

\- Solo artists

\- Group management

\- Album production

\- Album sales

\- Clothing and concepts

\- Daily schedules

\- Concerts

\- Tours

\- Fanbases

\- Company news

\- Random events



The game should emphasize long-term progression.



Players should begin with limited facilities and opportunities but gradually unlock more advanced systems through company upgrades, achievements in gameplay, reputation, and company tier.



Do not add selectable difficulty settings.



The game should naturally become more challenging as the company expands.



\---



\# 2. GAME START



\## Company creation



The player starts by creating a new entertainment company.



Required information:



\- Company name

\- CEO name



Optional:

\- Company logo style

\- Company description



Provide a simple company creation screen with a pixel-inspired interface.



The player should not choose a difficulty setting.



\## Starting resources



The player begins with:



Money: ₩100,000,000



Rubies: 100



Company tier: F



Company reputation: Local



Groups: 0



Solo artists: 0



Company trainees: 0



Starting audition capacity: 2 candidates



Starting company facilities should be limited.



The player should have enough starting money to experiment with auditions, training, company upgrades, and early management.



The starting budget should feel generous but not unlimited.



\## Initial tutorial



Provide a simple optional tutorial.



The tutorial should explain:



1\. How to recruit idols.

2\. How to create groups.

3\. How to train idols.

4\. How to produce albums.

5\. How to assign schedules.

6\. How to earn money.

7\. How to upgrade the company.

8\. How to advance the game week.



Do not force the player to follow a mandatory storyline.



\---



\# 3. GAME TIME AND WEEKLY PROGRESSION



\## Weekly clock



The game uses a weekly calendar.



Display:

\- Current year

\- Current month

\- Current week

\- Current date

\- Current weekday when relevant



The game should begin at a fixed starting date chosen consistently by the implementation.



The main progression control is:



\*\*Next Week\*\*



When the player clicks Next Week, the game advances by seven days.



The game should simulate all seven days internally, processing each day's planned activities in chronological order.



The weekly advancement must process:



\- Planned daily activities

\- Idol training

\- Fatigue

\- Stamina recovery

\- Loyalty changes

\- Group activities

\- Income

\- Expenses

\- Contracts

\- Album production

\- Album sales

\- Concerts

\- Reputation

\- Random events

\- News

\- Fanbase changes

\- Company tier requirements



The player should receive a weekly summary after the simulation completes.



\## Planned Activities



The player manages activities through a weekly planner.



Instead of having four schedule slots per day, the player assigns planned activities to each day of the week.



The weekly planner contains seven days:



\- Monday

\- Tuesday

\- Wednesday

\- Thursday

\- Friday

\- Saturday

\- Sunday



Each day can contain multiple planned activities.



There is no fixed limit of four activities per day.



The number of activities should be determined by the player's planning decisions and the availability of the selected idols or groups.



However, activities must respect:



\- Idol availability

\- Group availability

\- Stamina

\- Fatigue

\- Activity requirements

\- Production commitments

\- Concert commitments

\- Contract status

\- Other relevant restrictions



The player should be able to:



\- Add activities to a specific day.

\- Remove activities.

\- Edit planned activities.

\- Assign activities to individual idols.

\- Assign activities to entire groups.

\- Assign activities to solo artists.

\- Assign company-related activities.

\- View the activities planned for each day.

\- Review the entire week before advancing time.



Activities should not automatically be assigned to idols.



The player must manage the weekly planner manually.



\## Daily simulation



When the player advances the week, the game processes each day separately.



For each day:



1\. Process that day's planned activities.

2\. Apply activity rewards and costs.

3\. Consume stamina.

4\. Increase fatigue.

5\. Update idol popularity.

6\. Update group popularity.

7\. Update fanbase.

8\. Process contracts and loyalty.

9\. Process production progress.

10\. Process album sales.

11\. Process income and expenses.

12\. Process random events.

13\. Update news.

14\. Apply stamina recovery and fatigue reduction according to rest and recovery mechanics.



Activities should occur on their assigned game day.



Do not process all activities as if they happened simultaneously at the end of the week.



\## Weekly progression



The player should be able to review the planned activities for the entire week.



When Next Week is clicked:



\- Simulate Monday.

\- Simulate Tuesday.

\- Simulate Wednesday.

\- Simulate Thursday.

\- Simulate Friday.

\- Simulate Saturday.

\- Simulate Sunday.

\- Complete weekly calculations.

\- Generate the weekly summary.

\- Advance the game date by seven days.

\- Save the updated game state.



The game should not advance if the player cancels the progression confirmation.



Prevent the same planned activity from being processed more than once.



The game should preserve the player's weekly plan until the week has been simulated.



After the week ends, the planner should display the next week's schedule.



The player should be able to plan the next week before advancing time.



Do not automatically copy every activity from the previous week unless the player explicitly chooses to use a recurring activity or copy-plan feature.



The game must distinguish between:



\- Activities planned for the current week.

\- Activities already completed.

\- Activities planned for the next week.



The player should receive a weekly summary after the simulation completes.



\---



\# 4. GAME CURRENCIES



The game has two primary currencies.



\## Money



Currency: Korean won (₩)



Money can be earned through:



\- Album sales

\- Single sales

\- EP sales

\- Concerts

\- Tours

\- Group schedules

\- Solo schedules

\- Company events

\- Advertisements

\- Sponsorships

\- Fanmeetings

\- Company upgrades that generate revenue

\- Awards in a future expansion

\- Survival shows in a future expansion

\- Other appropriate entertainment activities



Money is spent on:



\- Auditions

\- Idol recruitment

\- Training

\- Company upgrades

\- Album production

\- Writers

\- Producers

\- Clothing

\- Marketing

\- Concert preparation

\- Idol salaries

\- Contract payments

\- Other operational expenses



Money should be displayed prominently.



Use Korean won formatting.



Example:



₩100,000,000



Do not display unnecessarily long decimal values.



\## Rubies



Rubies are the premium currency.



Rubies can be earned through:



\- Company upgrades

\- Random events

\- Special achievements in future expansions

\- Special recruitment opportunities

\- Other rare gameplay rewards



Rubies are spent on:



\- Premium auditions

\- High-tier clothing

\- Special recruitment

\- Premium company upgrades

\- Other premium opportunities



Do not implement real-money purchases.



Rubies must remain obtainable through gameplay.



The game must never require actual payment.



\---



\# 5. COMPANY TIERS



Company tiers:



F, D, C, B, A, S, P



Optional tier modifiers:



F+

D+

C+

B+

A+

S+

P+



The company tier should be calculated from a combination of:



\- Company reputation

\- Financial performance

\- Group popularity

\- Solo artist popularity

\- Idol development

\- Album sales

\- Concert performance

\- Company facilities

\- Successful activities



Do not make company tier depend only on money.



The company should have a separate company rating or progression score.



Use a weighted rating system.



The exact weights should be configurable in a central game balance configuration.



\## Company tier progression



Company progression should become increasingly demanding.



A company should not be able to reach S or P tier simply by repeatedly performing one profitable activity.



Require a combination of achievements and progression milestones.



For example:



\- Establishing the company

\- Recruiting idols

\- Forming groups

\- Debuting artists

\- Releasing albums

\- Developing a fanbase

\- Reaching higher revenue

\- Expanding company facilities

\- Performing concerts

\- Building international recognition



Company tier modifiers can display additional progression within the same tier.



However, modifiers must not create confusing or inconsistent tier calculations.



\---



\# 6. COMPANY REPUTATION



Company reputation tiers:



1\. Local

2\. Regional

3\. National

4\. International

5\. Global

6\. Worldwide



Reputation should be milestone-based.



The player should unlock reputation levels by reaching specific company achievements.



Examples:



Local:

\- Beginning company operations.

\- Recruiting idols.

\- Establishing a local fanbase.



Regional:

\- Successful debut.

\- Consistent regional popularity.

\- Successful local events.



National:

\- National popularity.

\- Successful albums.

\- Major domestic events.



International:

\- International fanbase.

\- International activities.

\- Successful overseas promotions.



Global:

\- Strong international recognition.

\- Global fanbase.

\- International concert success.



Worldwide:

\- Exceptional company progression.

\- High-level achievements across multiple systems.



The thresholds must be configurable.



Do not automatically increase reputation merely because the player has accumulated money.



Reputation should also be affected by significant negative events.



Examples:



\- Idol company dismissal.

\- Poor management.

\- Financial problems.

\- Failed activities.

\- Other significant company events.



Reputation loss should be proportional to the severity of the event.



Avoid excessive reputation penalties for ordinary gameplay mistakes.



\---



\# 7. COMPANY UPGRADES



Implement a simple upgrade tree with multiple branches.



Company upgrades should unlock new functionality and improve existing systems.



\## Upgrade branches



\### Headquarters



\- Basic company office

\- Improved company facilities

\- Additional management capabilities



\### Training



\- Better training facilities

\- Improved training efficiency

\- Additional training categories



\### Auditions



\- Increased audition capacity

\- Domestic auditions

\- International auditions

\- Global auditions



\### Production



\- Improved recording facilities

\- Improved album production quality

\- Additional production-related features



\### Marketing



\- Improved promotions

\- Increased popularity gains

\- Better event opportunities



\### Management



\- Additional group slots

\- Improved company operations

\- Better management capabilities



\## Upgrade rules



Every upgrade must have:



\- Name

\- Description

\- Cost

\- Prerequisites

\- Tier requirement if applicable

\- Effect

\- Unlock status



Upgrades should be purchased using money or rubies.



Some upgrades may require specific company reputation levels.



Upgrades must have meaningful benefits.



Do not implement upgrades that merely change decorative values.



\## Group slots



The company starts with a limited number of group slots.



The maximum group capacity is five groups.



Additional group slots should require company upgrades.



The company should not automatically have all five group slots available at the beginning.



\## Training unlocks



Main Training is available by default.



Main 2 and Main 3 training categories require progression and company upgrades.



\---



\# 8. IDOL SYSTEM



Idols are the central gameplay units.



Each idol must have a unique identity and a complete profile.



\## Idol information



Each idol should contain:



\- Unique ID

\- Name

\- Stage name

\- Gender

\- Age

\- Nationality

\- Personality

\- Potential

\- Visual rating

\- Popularity

\- Fanbase

\- Loyalty

\- Contract

\- Idol tier

\- Specialty

\- Training history

\- Group membership

\- Solo artist status

\- Fatigue

\- Stamina

\- Skill stats



Stage names should be editable.



The player should be able to inspect an idol's complete profile.



\## Idol specialties



Every idol should have one or more specialties.



Examples:



\- Vocal specialist

\- Dance specialist

\- Rap specialist

\- All-rounder

\- Composer

\- Performer

\- Entertainer



Specialties determine which stats receive additional weight when calculating idol overall rating.



Specialties should also influence training effectiveness.



\## Idol numerical stats



All skill stats use a range of 0–100.



Main stats:



\- Vocal

\- Dance

\- Rap

\- Stamina



Additional stats:



\- Musical

\- Language

\- Acting

\- Fitness

\- Composition

\- Writing

\- Choreography

\- Entertainment



Additional attributes:



\- Visual

\- Popularity

\- Potential

\- Loyalty

\- Fatigue



Do not confuse skill stats with popularity or loyalty.



Popularity and loyalty must be calculated and managed separately.



\## Idol tier calculation



Use the following exact tier thresholds.



| Tier | Overall rating |

|---|---|

| F | 0–9 |

| D | 10–19 |

| C | 20–39 |

| B | 40–69 |

| A | 70–87 |

| S | 88–94 |

| P | 95–100 |



These thresholds are mandatory.



Do not replace them with equal-sized intervals.



Do not automatically assign a high tier simply because an idol has one exceptionally strong stat.



\## Weighted overall rating



Calculate idol overall rating using a weighted average of relevant skill stats.



Different idol specialties should have different weights.



Example:



Vocal specialist:



\- Vocal receives the highest weight.

\- Musical receives a secondary weight.

\- Language, entertainment, and other relevant stats contribute smaller amounts.



Dance specialist:



\- Dance receives the highest weight.

\- Fitness and choreography receive secondary weights.



Rap specialist:



\- Rap receives the highest weight.

\- Writing and entertainment receive secondary weights.



All-rounder:



\- Uses a balanced combination of the relevant stats.



The overall rating should be configurable.



Use the weighted rating to determine idol tier.



The calculation must be transparent and consistent.



Do not artificially increase idol tiers during recruitment or training.



\## Idol potential



Potential represents an idol's long-term development ability.



Potential should influence:



\- Maximum skill growth

\- Training efficiency

\- Probability of significant improvement

\- Long-term progression



Potential should be generated during auditions.



Higher potential should be uncommon.



Potential must not guarantee an idol will become P-tier.



\## Idol personalities



Implement a simple personality system initially.



Examples:



Hardworking:

\- Small training efficiency bonus.



Creative:

\- Small songwriting or composition bonus.



Charismatic:

\- Small popularity bonus.



Perfectionist:

\- Small performance quality bonus.

\- Slightly increased fatigue under demanding schedules.



Shy:

\- Small penalty to certain entertainment activities.

\- Can improve through training.



Personalities should provide modest effects.



Do not introduce a complex personality simulation.



Personality effects should be configurable.



\---



\# 9. IDOL CONTRACTS



Implement a simplified contract system.



Each idol has:



\- Contract status

\- Contract duration

\- Contract start date

\- Contract expiration date

\- Salary

\- Renewal eligibility



Contracts should have a manageable duration.



The player should be able to:



\- Inspect contracts

\- Renew contracts

\- Terminate contracts

\- Manage salary

\- View expiration dates



Contract expiration should trigger a notification.



An idol should not disappear without warning.



Contract termination must be handled separately from kicking an idol out of a group.



The player should have clear confirmation before terminating a contract.



If a company contract is terminated, the idol leaves the company.



The consequences should depend on the reason and the idol's loyalty.



\---



\# 10. AUDITIONS AND RECRUITMENT



Implement two audition systems.



\## Audition Type 1: Money auditions



Available by default:



Streets



Additional types unlocked through company upgrades:



\- Domestic

\- International

\- Global



Audition costs should depend on the audition type.



Higher-level auditions should generally cost more money.



Higher-level auditions should provide better candidate pools.



However, recruitment should remain random.



\## Audition candidates



Every audition generates a group of candidates.



Each candidate should have:



\- Name

\- Gender

\- Age

\- Nationality

\- Personality

\- Specialty

\- Potential

\- Skill stats

\- Idol tier

\- Visual rating

\- Recruitment cost



The player should be able to inspect candidates before recruiting them.



Recruitment should require money.



The player may reject candidates.



Rejected candidates should not be automatically recruited.



\## Audition slots



Default candidate capacity:



2 slots



Maximum candidate capacity:



5 slots



The number of available slots should depend on:



\- Company tier

\- Company reputation

\- Company upgrades



Higher company progression should unlock more candidates.



\## Audition Type 2: Ruby auditions



Ruby auditions require rubies.



The player can select:



\- Idol gender

\- Recruitment duration

\- Candidate slots



Gender options:



\- Male

\- Female



Recruitment durations:



| Duration | Intended candidate tier range |

|---|---|

| 1 week | F–D |

| 3 weeks | D–C |

| 1 month | C–B |

| 2 months | A |



The highest intended tier for ruby auditions is A.



Ruby auditions should increase the probability of recruiting higher-tier idols.



They must not guarantee a particular tier.



The recruitment duration should affect the quality distribution.



Longer auditions should generally provide better candidates.



However, candidate quality must still be influenced by randomness and potential.



Do not allow ruby auditions to generate S- or P-tier idols directly.



\---



\# 11. GROUP FORMATION



The player can form boy groups and girl groups.



Maximum groups:



5



The available number of groups depends on company progression and upgrades.



\## Group information



Each group must have:



\- Unique ID

\- Group name

\- Group gender

\- Group members

\- Group popularity

\- Group fanbase

\- Group tier

\- Debut date

\- Company reputation contribution

\- Income distribution

\- Loyalty

\- Current production

\- Current promotional status



The player should be able to create groups from idols who belong to the company.



\## Group members



Initial group membership should support a manageable number of members.



The maximum group membership is 10 idols.



Additional member slots should require appropriate upgrades or premium progression.



Do not allow a group to exceed its maximum member capacity.



Do not allow idols to belong to multiple groups simultaneously.



Do not allow an idol to be assigned to a boy group and girl group simultaneously.



Group formation should require appropriate member selection.



\## Group roles



Available roles:



\- Leader

\- Main vocalist

\- Lead vocalist

\- Main dancer

\- Lead dancer

\- Main rapper

\- Lead rapper

\- Visual

\- Center



Members may hold multiple roles.



The player should be able to assign roles manually.



Role assignments should be displayed in the group profile.



The player should be able to remove or change roles.



\### Maknae



Maknae is not a manually assigned role.



Automatically identify the youngest member of the group.



Display the Maknae label next to that idol's profile or name.



If multiple idols share the same youngest age, use a consistent tie-breaking rule.



Do not assign Maknae to an idol who is not the youngest.



\## Solo artists



The player can manage solo artists.



Solo artists should have:



\- Individual popularity

\- Individual fanbase

\- Individual schedules

\- Individual production

\- Individual contracts

\- Individual income

\- Individual clothing

\- Individual training



Solo artists should not count toward group member capacity.



Solo artist activities should use the same management systems where appropriate.



Do not implement subunits in the initial version.



\---



\# 12. GROUP AND COMPANY MEMBER REMOVAL



This system is important.



The player must be able to remove idols from groups or from the company.



\## Removing an idol from a group



The player can manually kick an idol out of a group.



This action should require confirmation.



Consequences:



\- Group loyalty decreases.

\- Group popularity may decrease slightly.

\- The idol becomes a trainee again.

\- The idol retains all stats.

\- The idol retains potential.

\- The idol retains personality.

\- The idol retains training history.

\- The idol retains company contract status.



The idol should not lose their stats.



The idol should not disappear from the company.



\## Rejoining a group



After being removed from a group, the idol receives a six-month cooldown.



During the cooldown:



\- The idol cannot join a new group.

\- The idol cannot rejoin the previous group.

\- The idol cannot be assigned to another group.

\- The idol remains available as a trainee.



The cooldown should be calculated using game dates.



After six months have passed, the idol may join a group again.



The cooldown must persist through save/load.



\## Removing an idol from the company



The player can permanently kick an idol out of the company.



This action requires a strong confirmation prompt.



The player must understand that the action is permanent.



Consequences:



\- The idol leaves the company.

\- The idol is removed from the company roster.

\- The idol is removed from their group.

\- Group loyalty decreases significantly.

\- Company reputation decreases.

\- The group may experience popularity loss.

\- Group performance may be affected.

\- The idol's contract is terminated.



The idol should no longer be available for recruitment or management.



Do not automatically return the idol to the trainee roster.



The player should not be able to reverse this action through ordinary gameplay.



\## Group disbandment



The player can manually disband a group.



Group disbandment should:



\- Remove the group.

\- Release all members from the group.

\- Return eligible idols to the trainee roster.

\- Preserve idol stats.

\- Preserve contracts.

\- Preserve training history.

\- Apply appropriate loyalty consequences.

\- Remove group-specific production.

\- Cancel future group schedules where necessary.



Disbandment should not automatically terminate company contracts.



Do not allow a group to disband while an active production or promotion is running without warning.



The player should receive a confirmation dialog.



Disbandment may also occur through certain future events, but initially it should primarily be player-controlled.



\---



\# 13. LOYALTY SYSTEM



Use the term \*\*Loyalty\*\*.



Do not call this system Morale.



Loyalty should represent an idol's willingness to remain with the company and group.



Each idol has individual loyalty.



Groups should also have group loyalty.



Loyalty should be affected by:



\- Income distribution

\- Contract management

\- Training

\- Scheduling

\- Fatigue

\- Company reputation

\- Group stability

\- Member removal

\- Company financial problems

\- Successful activities

\- Company support



Use a configurable loyalty range.



Suggested range:



0–100



High loyalty:



\- Lower probability of leaving.

\- More stable group membership.

\- Better resistance to negative events.



Low loyalty:



\- Higher probability of leaving.

\- Higher risk of group instability.

\- Increased contract-related problems.



Do not cause idols to leave randomly without warning.



Before a major departure, provide notifications or warning indicators.



\---



\# 14. COMPANY AND GROUP INCOME DISTRIBUTION



This is a major gameplay system.



Each group has an adjustable income distribution.



The player determines how group-related income is divided between:



\- Company

\- Group



The distribution must total exactly 100%.



Example:



Company: 40%



Group: 60%



Other valid examples:



Company: 50%



Group: 50%



Company: 30%



Group: 70%



The player should be able to adjust the percentages.



However, distribution changes are restricted during active production and album promotions.



\## Distribution adjustment restrictions



The player may adjust the distribution only when:



\- The group is not currently producing an album.

\- The group is not currently in an active album promotion or sales period.



Once an album promotion and sales period has ended, distribution may be adjusted again.



The UI should clearly explain when changes are unavailable.



Do not allow distribution changes to retroactively modify existing income.



\## Group income



Group income should be generated from:



\- Album sales

\- Concerts

\- Group schedules

\- Fanmeetings

\- Other group-related activities



The company and group shares must be calculated separately.



The distribution percentage should be applied consistently.



\## Distribution effects



The distribution percentage should influence the group's development and company financial stability.



\### Group receives 70% or more



Positive effects:



\- Improved idol loyalty.

\- Increased idol training efficiency.

\- Better idol stat growth.

\- Improved group stability.



The magnitude of the bonuses should depend on the percentage.



Negative effects:



\- Company receives less immediate income.

\- Company income may be delayed.

\- Company operational expenses may become more difficult to manage.

\- Company debt risk increases if the company cannot maintain expenses.



Debt risk should depend on the severity of the financial situation.



Do not automatically create debt simply because the group receives 70%.



The company should first experience reduced cash flow.



Debt should be a potential consequence of sustained financial problems.



\### Company receives 70% or more



Positive effects:



\- Increased company income.

\- Improved company financial growth.

\- Better income from group-related activities.



Negative effects:



\- Idol loyalty decreases.

\- Group loyalty decreases.

\- Idols may become dissatisfied.

\- Departure probability increases.

\- Company reputation may eventually suffer.



The effects should become more severe as the company share increases.



A company receiving 90% should experience significantly stronger consequences than a company receiving 70%.



However, the player should not lose idols instantly.



Provide warning notifications.



\## Retention offers



When an idol attempts to leave the company or group because of low loyalty, the player may offer money to retain them.



The retention offer should:



\- Cost company money.

\- Increase loyalty.

\- Reduce the departure probability.

\- Become progressively more expensive if the same idol repeatedly considers leaving.



Repeated retention offers should not be a guaranteed permanent solution.



The cost should increase based on:



\- Previous offers

\- Idol popularity

\- Idol tier

\- Loyalty

\- Company financial conditions



Do not allow unlimited free retention.



\---



\# 15. TRAINING SYSTEM



Training improves idol stats.



Training should consume:



\- Money

\- Stamina

\- Training time

\- Schedule capacity



Training should increase fatigue.



The player can assign training to individual idols or groups.



\## Main Training



Available from the beginning.



Skills:



\- Vocal

\- Dance

\- Rap

\- Stamina



\## Main 2 Training



Unlock through company progression and upgrades.



Skills:



\- Musical

\- Language

\- Acting

\- Fitness



\## Main 3 Training



Unlock through company progression and upgrades.



Skills:



\- Composition

\- Writing

\- Choreography

\- Entertainment



The player should not have access to all training categories at the beginning.



\## Training behavior



Training should:



\- Increase the selected stat.

\- Consume stamina.

\- Increase fatigue.

\- Cost money.

\- Respect the idol's potential.

\- Respect the idol's specialty.

\- Allow gradual progression.



Training should not automatically increase idol tier.



Idol tier changes only when the weighted overall rating crosses a threshold.



\## Training efficiency



Training efficiency should depend on:



\- Idol specialty

\- Potential

\- Company facilities

\- Fatigue

\- Loyalty

\- Training type



Training should provide diminishing returns at high stats.



Avoid allowing stats to increase excessively through repeated training.



The player should have to manage schedules and recovery.



\---



\# 16. FATIGUE AND STAMINA



Every idol has:



\- Stamina

\- Fatigue



Stamina determines how much activity an idol can perform.



Fatigue represents accumulated exhaustion.



Activities consume stamina and increase fatigue.



Rest and vacations should recover stamina and reduce fatigue.



High fatigue should:



\- Reduce training efficiency.

\- Reduce performance quality.

\- Increase risk of poor activity outcomes.

\- Increase the chance of negative events.



Do not make ordinary fatigue excessively punishing.



Provide clear visual indicators.



The player should be able to identify overworked idols.



\---



\# 17. CLOTHING AND CONCEPT SYSTEM



Clothing is a permanent wardrobe unlock system.



Once purchased, clothing can be reused.



The player can equip clothing on idols or groups.



\## Clothing concepts



\- Pure

\- Cute

\- Chic

\- Sexy



\## Clothing tiers



F through A:



Purchased using money.



S through P:



Purchased using rubies.



Each outfit should have:



\- Name

\- Tier

\- Concept

\- Price

\- Unlock status

\- Compatible concepts

\- Performance bonuses



Clothing should influence:



\- Album concept compatibility

\- Popularity

\- Album quality

\- Performance quality

\- Visual appeal



Outfits should not directly increase core skill stats.



Clothing bonuses should be modest.



The player should be able to inspect their wardrobe.



The player should be able to equip and unequip clothing.



Purchased outfits must remain available permanently.



\---



\# 18. ALBUM PRODUCTION



Album production is one of the primary gameplay systems.



The player can produce:



\- Single

\- EP

\- Album



Each release belongs to a group or solo artist.



\## Production duration



Single:



1 week



EP:



3 weeks



Album:



1 month



Use four weeks as the initial standard game-month duration.



The production duration should be configurable.



\## Production workflow



The player must:



1\. Select a group or solo artist.

2\. Select release type.

3\. Select album name.

4\. Select genre.

5\. Select concept.

6\. Assign songwriter.

7\. Assign producer.

8\. Record songs.

9\. Complete production.

10\. Release the album.

11\. Begin sales and promotion.



The interface should clearly display production progress.



\## Genres



Implement an initial set of genres.



Examples:



\- Pop

\- Dance-pop

\- R\&B

\- Hip-hop

\- Electronic

\- Ballad

\- Rock



Genres should have different trend compatibility.



\## Album concepts



Concepts:



\- Pure

\- Cute

\- Chic

\- Sexy



Concept compatibility should influence album quality and sales.



\## Writers and producers



The player can assign:



\- Company writers

\- Company producers

\- Idol members



Assigning a writer or producer should require money where appropriate.



Idol members can participate if their skills are sufficient.



Relevant stats:



Writer:



\- Writing

\- Composition



Producer:



\- Composition

\- Musical



Idol participation should provide bonuses based on their skills.



The player should not be required to hire external staff for every release.



\## Recording



Recording requires stamina.



Recording should:



\- Consume stamina.

\- Consume schedule capacity.

\- Increase production progress.

\- Contribute to album quality.



Do not allow unlimited recording without stamina consequences.



\## Album quality



Album quality should depend on:



\- Idol skill

\- Producer skill

\- Writer skill

\- Recording performance

\- Genre

\- Concept compatibility

\- Company facilities

\- Clothing

\- Production costs



Album quality should be calculated consistently.



Do not generate arbitrary quality values unrelated to the player's decisions.



\---



\# 19. TRENDS



Implement a trend system.



Trends should change over time.



Each week, the game can generate a small number of trending genres and concepts.



Examples:



\- Dance-pop becomes popular.

\- Cute concepts become popular.

\- R\&B becomes popular.

\- Chic concepts become popular.



Trends should influence:



\- Album sales

\- Popularity

\- Fanbase growth

\- Event performance



The player should be able to inspect current trends before producing an album.



Trends should not guarantee successful sales.



The game should reward strategic choices.



Keep the initial trend system simple.



\---



\# 20. ALBUM SALES



Album sales are a major source of revenue.



Each album has a sales period.



Initial sales duration:



10 real-time minutes while the game is open.



This is an actual timer, not ten game weeks.



The player should be able to perform other activities while sales are running.



\## Sales behavior



During sales:



\- Generate sales progress.

\- Calculate album revenue.

\- Update popularity.

\- Update fanbase.

\- Apply income distribution.

\- Update company financial records.



Sales should depend on:



\- Idol popularity

\- Group popularity

\- Idol tier

\- Group tier

\- Company reputation

\- Company tier

\- Album quality

\- Album concept

\- Genre trends

\- Clothing

\- Fanbase

\- Marketing

\- Production quality



The sales calculation should be configurable.



Avoid extremely large arbitrary sales numbers.



The economy should be balanced around the starting budget.



\## Sales progress



The player should be able to inspect:



\- Sales progress

\- Current sales

\- Estimated revenue

\- Remaining sales time

\- Album quality

\- Popularity impact



The player should receive a sales summary when the period ends.



\## Offline progress



Album sales should run in real time while the game is open.



When the player closes the game or refreshes the page, save the sales start timestamp.



When the player returns:



1\. Read the last saved sales timestamp.

2\. Calculate elapsed real-world time.

3\. Apply eligible offline sales progress.

4\. Complete sales if the 10-minute duration has elapsed.

5\. Update financial records.

6\. Save the result.



Do not allow duplicate offline sales rewards.



Do not calculate offline progress from the current game week alone.



Use real timestamps.



The game must remain completely offline.



Do not use a server to calculate offline progress.



\---



\# 21. PLANNED ACTIVITIES SYSTEM



The game uses a weekly activity planner.



The player plans activities for each day of the week rather than assigning four schedule slots per day.



\## Weekly planner



The planner contains seven days:



\- Monday

\- Tuesday

\- Wednesday

\- Thursday

\- Friday

\- Saturday

\- Sunday



Each day can contain multiple planned activities.



There is no fixed limit of four activities per day.



The player should be able to inspect the entire weekly plan.



The interface should display:



\- Day

\- Planned activities

\- Assigned idols

\- Assigned groups

\- Activity type

\- Estimated income

\- Stamina requirements

\- Fatigue impact

\- Activity status



\## Activity assignment



Activities can be assigned to:



\- Individual idols

\- Entire groups

\- Solo artists

\- Company-related participants



The player should be able to select the target before assigning an activity.



Group activities should apply to eligible group members.



Individual activities should apply only to the selected idol.



Company-related activities may include multiple eligible idols or groups.



Do not automatically assign activities.



The player should control the weekly plan.



\## Activity types



\### Vacation



\- Reduces fatigue.

\- Restores stamina.

\- May improve loyalty.

\- Generates no direct income.



\### Small events



Examples:



\- Local appearance

\- Small interview

\- Radio appearance

\- Small fan event



These generate modest income and popularity.



\### Big events



Examples:



\- Major television appearance

\- Large promotional event

\- Major advertisement

\- High-profile performance



These generate higher rewards but require stronger popularity and may increase fatigue.



\### Solo events



The player selects an individual idol.



Examples:



\- Solo interview

\- Individual advertisement

\- Solo performance

\- Individual variety appearance



Rewards should depend on idol popularity and relevant stats.



\### Company-related events



Examples:



\- Fanmeeting

\- Album showcase

\- Reality show

\- Company promotional event



These can target groups or multiple company idols.



\## Activity consequences



Activities should affect:



\- Money

\- Popularity

\- Fanbase

\- Loyalty

\- Stamina

\- Fatigue

\- Reputation



The player should be able to reduce the number of planned activities.



Days without activities should allow idols to recover according to the recovery mechanics.



Do not automatically fill empty days.



The player should be able to plan rest days.



\## Activity validation



Prevent:



\- Scheduling the same idol in conflicting activities on the same day.

\- Assigning group activities to groups that do not exist.

\- Assigning activities to idols who have left the company.

\- Assigning incompatible activities during active production.

\- Assigning activities that violate concert commitments.

\- Scheduling activities that exceed available stamina without appropriate consequences.



Multiple activities on the same day are allowed if they are compatible.



However, each activity should consume appropriate stamina and contribute to fatigue.



The player should receive warnings when planning excessive activities.



Do not arbitrarily reject every additional activity simply because another activity is already planned for that day.



\## Activity editing



The player must be able to:



\- Add an activity.

\- Remove an activity.

\- Change the activity type.

\- Change the assigned idol or group.

\- Move an activity to another day.

\- Review activity requirements.

\- Review estimated rewards.

\- Review fatigue and stamina consequences.



Changes should be saved.



The planner should remain editable until the relevant week is simulated.



\## Daily simulation



When the player advances the week, activities are processed on their assigned days.



Each day should process:



1\. Planned activities.

2\. Activity costs.

3\. Activity rewards.

4\. Stamina consumption.

5\. Fatigue increases.

6\. Popularity changes.

7\. Fanbase changes.

8\. Loyalty changes.

9\. Production progress.

10\. Album sales.

11\. Contract processing.

12\. Random events.

13\. Recovery.



The simulation should respect activity order.



Do not apply all activity rewards simultaneously without considering the day on which they occur.



\## Weekly summary



At the end of the week, display:



\- Completed activities.

\- Income.

\- Expenses.

\- Net profit.

\- Idol training progress.

\- Idol fatigue.

\- Popularity changes.

\- Fanbase changes.

\- Loyalty changes.

\- Album sales.

\- Reputation changes.

\- Important events.

\- Upcoming activities.



The summary must reflect actual processed activities.



Do not generate fictional activity results.



\## Recurring activities



Recurring activities are optional.



If implemented, the player may choose to repeat an activity on selected days.



Recurring activities must be editable.



Do not automatically copy the previous week's plan without player confirmation.



The weekly planner should support future expansion without requiring a fixed number of daily activity slots.



\----



\# 22. CONCERT SYSTEM



Concerts should be a major progression feature.



Concert types:



\- Domestic concerts

\- International concerts

\- Global concerts



Concerts should require minimum popularity and company progression.



\## Concert preparation



The player should select:



\- Group or solo artist

\- Concert type

\- Venue

\- Ticket price

\- Marketing budget

\- Concert date



Concerts should consume preparation time.



The player should not be able to instantly perform a concert without planning.



\## Concert results



Concert results should depend on:



\- Popularity

\- Fanbase

\- Idol stats

\- Group performance

\- Company reputation

\- Venue capacity

\- Ticket price

\- Marketing

\- Fatigue



Concerts generate:



\- Money

\- Popularity

\- Fanbase growth

\- Reputation



Concerts also create fatigue.



\## Concert venues



Implement a simple venue system.



Example venue sizes:



\- Small venue

\- Medium venue

\- Large venue

\- Stadium



Each venue has:



\- Capacity

\- Rental cost

\- Minimum popularity requirement

\- Concert type compatibility



Venue capacity should limit ticket sales.



The player should not sell more tickets than the venue can accommodate.



\## Concert progression



Domestic concerts should unlock first.



International concerts should require higher popularity and reputation.



Global concerts should require significant company progression.



\## Tours



Tours unlock after a group has successfully sold out eligible concerts.



Tours should require:



\- Multiple concert dates

\- Appropriate venues

\- Preparation

\- Financial investment



Tour rewards should be higher than individual concerts.



However, tours should also increase fatigue and expenses.



\## Company concert



Company concerts unlock when:



\- Company tier reaches S.

\- Company reputation reaches Global.



Company concerts should include multiple eligible company groups and solo artists.



They should be more expensive and more rewarding than ordinary concerts.



Do not implement company concerts as a simple button that instantly grants money.



\---



\# 23. FANBASE SYSTEM



Implement a simple fanbase system.



Each idol has individual popularity and fanbase.



Groups have group popularity and fanbase.



Solo artists have individual fanbases.



Fanbase should influence:



\- Album sales

\- Concert attendance

\- Schedule income

\- Popularity

\- Event opportunities



Fanbase growth should depend on:



\- Successful activities

\- Album releases

\- Trends

\- Concerts

\- Marketing

\- Popularity

\- Company reputation



Fanbase should not grow excessively from ordinary activities.



The player should be able to inspect fanbase information.



Display:



\- Total fans

\- Weekly growth

\- Popularity

\- Fan engagement

\- Group or idol ranking



Keep the initial fanbase model simple.



\---



\# 24. NEWS SYSTEM



Implement a lightweight news system.



The news feed should provide short, generated text updates.



News should be based on actual game events.



Examples:



\- A group releases a new album.

\- A group reaches a popularity milestone.

\- An idol receives a major event opportunity.

\- A concert sells out.

\- A company upgrade is completed.

\- An idol experiences a negative event.

\- A group gains a large number of fans.

\- A company reaches a new reputation tier.



News should not invent events that did not occur.



Use predefined templates and procedural text generation.



The news feed should have timestamps.



The player should be able to review previous news.



Limit the number of stored news items to avoid excessive save-file growth.



\---



\# 25. RANDOM EVENTS



Implement a small initial random event system.



Events should be generated from predefined templates.



Examples:



Positive:



\- A song becomes popular.

\- An idol receives unexpected attention.

\- A company receives a promotional opportunity.

\- A group gains additional fans.

\- A company receives a small financial opportunity.



Negative:



\- An idol becomes exhausted.

\- A promotional activity performs poorly.

\- A company incurs an unexpected expense.

\- A group experiences a minor loyalty problem.



Events should have:



\- Name

\- Description

\- Conditions

\- Probability

\- Effects

\- Optional player decision



Events should not occur excessively.



Avoid events that immediately destroy the player's company.



The event system should be configurable.



Do not implement complex scandals or severe negative events in the initial version.



\---



\# 26. STATISTICS AND REPORTS



Implement a statistics screen.



The player should be able to inspect:



\## Company statistics



\- Total money

\- Total rubies

\- Total expenses

\- Total revenue

\- Company tier

\- Company reputation

\- Group count

\- Solo artist count

\- Trainee count

\- Total fanbase



\## Idol statistics



\- Idol tier

\- Skill stats

\- Popularity

\- Loyalty

\- Fatigue

\- Stamina

\- Potential

\- Contract status



\## Group statistics



\- Group tier

\- Popularity

\- Fanbase

\- Loyalty

\- Member count

\- Album history

\- Concert history

\- Income distribution



\## Album statistics



\- Album quality

\- Genre

\- Concept

\- Sales

\- Revenue

\- Production duration

\- Promotion status



\## Weekly reports



After each week, display:



\- Income

\- Expenses

\- Net profit

\- Idol growth

\- Group growth

\- Fanbase changes

\- Album sales

\- Reputation changes

\- Important events

\- Upcoming activities



Reports should be calculated from actual game state.



Do not hardcode report results.



\---



\# 27. SAVE SYSTEM



The game must support persistent local saves.



Use browser LocalStorage.



Implement:



\- Automatic saving

\- Manual saving

\- Multiple save slots

\- Load game

\- Delete save

\- Export save

\- Import save

\- Reset game



\## Save requirements



The save system must preserve:



\- Company information

\- Resources

\- Company tier

\- Company reputation

\- Company upgrades

\- Idol roster

\- Idol stats

\- Idol personalities

\- Idol contracts

\- Idol loyalty

\- Group information

\- Group roles

\- Group membership

\- Solo artists

\- Training progress

\- Clothing inventory

\- Equipped clothing

\- Album production

\- Album sales

\- Income distribution

\- Schedules

\- Concerts

\- Tours

\- Fanbase

\- News

\- Random events

\- Game date

\- Cooldowns

\- Pending activities

\- Offline sales timestamps



Use a versioned save format.



Example:



saveVersion: 1



The game should validate imported saves.



If a save is invalid, show an error.



Do not overwrite the current game automatically when an invalid save is imported.



\## Save migration



Design the save system so future updates can introduce new fields.



Missing optional fields should receive safe defaults.



Do not crash when loading older saves.



\## Autosave



Autosave after:



\- Major management actions

\- Purchases

\- Recruitment

\- Training

\- Group formation

\- Production changes

\- Schedule changes

\- Weekly progression

\- Sales completion



Autosave must not duplicate rewards.



\---



\# 28. USER INTERFACE



The UI should be desktop-first.



Use a responsive layout.



The design should be inspired by:



\- Retro pixel management games

\- 16-bit aesthetics

\- Cute pastel colors

\- K-pop entertainment company themes

\- Pixel-inspired icons

\- Compact management dashboards



\## Visual direction



Use:



\- Pastel pink

\- Purple

\- Lavender

\- Soft blue

\- Cream

\- Dark neutral backgrounds where appropriate



Use pixel-style borders and subtle retro details.



Do not make the interface excessively cluttered.



The interface should be readable.



Do not use oversized decorative graphics that make management difficult.



\## Main layout



Suggested desktop layout:



\### Top navigation



Display:



\- Company name

\- Company tier

\- Reputation

\- Money

\- Rubies

\- Current game date

\- Next Week button



\### Left sidebar



Navigation:



\- Dashboard

\- Company

\- Auditions

\- Idols

\- Groups

\- Solo Artists

\- Training

\- Production

\- Schedules

\- Concerts

\- Wardrobe

\- News

\- Statistics

\- Save/Load



\### Main content



The main content should change based on the selected navigation item.



\### Dashboard



Display:



\- Company overview

\- Current resources

\- Active productions

\- Upcoming schedules

\- Recent news

\- Group overview

\- Idol overview

\- Current trends

\- Important warnings



The dashboard should be useful, not merely decorative.



\## Responsive behavior



Desktop is the primary target.



For smaller screens:



\- Sidebar should collapse.

\- Navigation should remain accessible.

\- Tables should become scrollable or card-based.

\- Controls should remain usable.

\- No essential functionality should disappear.



\---



\# 29. REACT ARCHITECTURE



Build the game using React.



Prefer TypeScript if practical.



Use a clean component-based architecture.



Do not put all gameplay logic inside one component.



Separate:



\- Game state

\- Simulation logic

\- UI components

\- Data models

\- Save system

\- Game configuration

\- Utility functions



\## Suggested architecture



src/



&#x20; components/



&#x20;   layout/



&#x20;   dashboard/



&#x20;   company/



&#x20;   idols/



&#x20;   groups/



&#x20;   auditions/



&#x20;   training/



&#x20;   production/



&#x20;   schedules/



&#x20;   concerts/



&#x20;   wardrobe/



&#x20;   news/



&#x20;   statistics/



&#x20;   save/



&#x20; game/



&#x20;   models/



&#x20;   state/



&#x20;   simulation/



&#x20;   economy/



&#x20;   progression/



&#x20;   auditions/



&#x20;   idols/



&#x20;   groups/



&#x20;   production/



&#x20;   schedules/



&#x20;   concerts/



&#x20;   events/



&#x20;   save/



&#x20; data/



&#x20;   idolNames/



&#x20;   personalities/



&#x20;   genres/



&#x20;   concepts/



&#x20;   clothing/



&#x20;   events/



&#x20; config/



&#x20;   gameBalance/



&#x20;   progression/



&#x20; utils/



&#x20; App.tsx



This is a suggested organization.



You may improve it if necessary.



However, keep the architecture modular.



\## Game engine



Create a central game engine responsible for:



\- Weekly progression

\- Daily simulation

\- Weekly planned activity management

\- Activity assignment and validation

\- Financial calculations

\- Training

\- Production

\- Sales

\- Loyalty

\- Reputation

\- Random events

\- Contract processing

\- Save/load



React components should call game actions.



React components should not independently calculate important gameplay rewards.



Use centralized simulation functions.



\## Game state



Use a centralized state management approach.



React Context or another lightweight local solution is acceptable.



Do not introduce unnecessary external state management libraries.



All game actions must update a consistent state.



Use unique IDs for:



\- Idols

\- Groups

\- Albums

\- Events

\- Contracts

\- Schedules

\- Save slots



Do not rely on array indexes as permanent identifiers.



\## Game configuration



Place important balance values in a centralized configuration.



Examples:



\- Starting money

\- Starting rubies

\- Idol tier thresholds

\- Training costs

\- Training efficiency

\- Audition costs

\- Production durations

\- Sales duration

\- Income distribution effects

\- Company tier requirements

\- Reputation requirements

\- Upgrade costs

\- Concert capacities

\- Event probabilities

\- Loyalty thresholds



Do not scatter hardcoded balance values across components.



\---



\# 30. OFFLINE AND GITHUB PAGES REQUIREMENTS



The game must be compatible with GitHub Pages.



Use a static frontend build.



Do not require:



\- Backend server

\- Database

\- Authentication

\- API keys

\- Cloud functions

\- Server-side rendering

\- External AI services



Use local assets.



Avoid relying on remote image URLs.



The game should use:



\- CSS pixel-inspired artwork

\- Local icons

\- Local decorative assets

\- Procedural text

\- Local data



\## GitHub Pages



Configure the project for GitHub Pages deployment.



Ensure:



\- The build succeeds.

\- Asset paths work under a GitHub Pages subpath.

\- Refreshing the application does not break navigation.

\- The game does not depend on server-side routing.

\- LocalStorage works.

\- The application remains functional after deployment.



If using Vite, configure the base path appropriately.



Provide a clear README with:



\- Installation

\- Development

\- Build

\- GitHub Pages deployment

\- Save system information



Do not use any feature that requires internet access during gameplay.



\---



\# 31. GAME BALANCING



The game should be designed around gradual progression.



The player should begin with:



\- Limited company facilities

\- A small roster

\- Basic training

\- Basic auditions

\- Limited group capacity



The player should gradually unlock:



\- Better auditions

\- More candidates

\- Additional training

\- Better facilities

\- International opportunities

\- Larger concerts

\- Higher company reputation

\- More group slots



\## Economy balance



Starting money should be sufficient for early experimentation.



However:



\- Training should cost money.

\- Auditions should cost money.

\- Production should cost money.

\- Company upgrades should cost money.

\- Concerts should require investment.

\- Salaries should be manageable.



Do not allow the player to earn unlimited money from a single repeated action.



Do not make all activities equally profitable.



Higher-risk activities should generally have greater potential rewards.



The economy should be configurable.



\## Progression balance



Idol progression should be gradual.



High-tier idols should be rare.



Company tier progression should require meaningful development.



Company reputation should require milestones.



The game should not become trivial after the first album.



\---



\# 32. FUTURE FEATURES



Do not implement the following features in the initial version.



However, design the architecture so they can be added later.



Future expansions:



\- Survival shows

\- Awards

\- Achievements

\- Rival companies

\- Idol scandals

\- Dating and relationships

\- Subunits

\- Additional contract mechanics

\- Expanded personalities

\- More random events

\- Additional concert systems

\- Advanced company rankings

\- More clothing

\- More production systems

\- Special idol recruitment

\- More detailed company reputation



Do not create unfinished placeholder screens for these features.



Do not include Awards or Achievements in the initial playable version.



Keep the initial random event system small.



The game should focus on the features described in this specification.



\---



\# 33. FUNCTIONALITY REQUIREMENTS



Every interactive element must work.



Do not create buttons that merely look functional.



Examples:



Next Week:

\- Advances the game.

\- Processes all required simulation systems.

\- Displays a weekly summary.

\- Saves the game.



Recruit:

\- Deducts money.

\- Adds the idol.

\- Updates company state.

\- Saves the game.



Training:

\- Deducts money.

\- Consumes stamina.

\- Increases fatigue.

\- Updates stats.

\- Saves the game.



Create Group:

\- Validates selected idols.

\- Validates group capacity.

\- Creates the group.

\- Updates idol membership.



Produce Album:

\- Validates group or artist.

\- Validates production requirements.

\- Deducts production costs.

\- Creates production state.



Schedule:

\- Validates available slots.

\- Assigns activity.

\- Updates schedule.



Concert:

\- Validates popularity.

\- Validates venue.

\- Validates finances.

\- Creates concert state.



Save:

\- Persists the complete game state.



Load:

\- Restores the selected save.



Every action must update the UI.



Every action must respect game rules.



Do not leave buttons with empty click handlers.



Do not use fake data for completed game systems.



\---



\# 34. ERROR HANDLING



Implement clear error handling.



Examples:



\- Insufficient money.

\- Insufficient rubies.

\- Insufficient stamina.

\- Missing company upgrade.

\- Maximum group capacity.

\- Maximum group members.

\- Invalid idol assignment.

\- Active album production.

\- Active promotion.

\- Invalid schedule.

\- Invalid contract.

\- Invalid save file.



Use readable notifications.



Do not silently fail.



Do not crash when the player performs an invalid action.



Use confirmation dialogs for:



\- Kicking idols out of groups

\- Kicking idols out of the company

\- Disbanding groups

\- Terminating contracts

\- Deleting saves

\- Resetting the game

\- Other irreversible actions



\---



\# 35. DEVELOPMENT AND IMPLEMENTATION PROCESS



Build the project in stages.



Do not attempt to implement every system simultaneously without validating the underlying game state.



\## Stage 1: Foundation



Implement:



\- React project

\- Main layout

\- Pixel-inspired design

\- Company creation

\- Initial resources

\- Weekly clock

\- Next Week

\- Central game state

\- LocalStorage

\- Save/load

\- Company tier

\- Company reputation



The result must be playable.



\## Stage 2: Idols



Implement:



\- Idol data model

\- Random idol generation

\- Auditions

\- Recruitment

\- Idol profile

\- Idol stats

\- Potential

\- Personality

\- Weighted tier calculation

\- Training

\- Fatigue

\- Stamina

\- Contracts



Validate that training and recruitment work.



\## Stage 3: Groups



Implement:



\- Group formation

\- Group membership

\- Group roles

\- Maknae detection

\- Solo artists

\- Group loyalty

\- Income distribution

\- Member removal

\- Company removal

\- Group disbandment

\- Six-month cooldown



Validate all membership restrictions.



\## Stage 4: Production



Implement:



\- Single

\- EP

\- Album

\- Genre

\- Concept

\- Writer

\- Producer

\- Recording

\- Production progress

\- Trends

\- Clothing compatibility

\- Album quality

\- Sales timer

\- Offline sales progress



Validate that sales cannot be duplicated.



\## Stage 5: Planned Activities



Implement:



\- Seven-day weekly planner

\- Multiple activities per day

\- Individual idol activities

\- Group activities

\- Solo artist activities

\- Company events

\- Vacation

\- Activity editing

\- Activity removal

\- Activity validation

\- Stamina

\- Fatigue

\- Income

\- Daily simulation

\- Weekly summaries



Validate activity conflicts and ensure activities are processed on their assigned days.



\## Stage 6: Concerts



Implement:



\- Domestic concerts

\- International concerts

\- Global concerts

\- Venue selection

\- Ticket pricing

\- Concert preparation

\- Concert results

\- Tours

\- Company concert unlock conditions



\## Stage 7: Additional systems



Implement:



\- Fanbase

\- News

\- Small random event system

\- Statistics

\- Dashboard reports

\- Final balancing



\## Stage 8: Testing and polish



Test:



\- Game progression

\- Financial calculations

\- Idol tier calculations

\- Group formation

\- Idol removal

\- Loyalty

\- Production

\- Album sales

\- Offline progress

\- Save/load

\- GitHub Pages compatibility

\- Responsive layout

\- Error handling



Do not proceed to advanced systems if the foundational systems are broken.



\---



\# 36. REQUIRED TEST SCENARIOS



Create a basic testing checklist.



Test the following scenarios:



1. Start a new company.
2. Confirm starting money and rubies.
3. Recruit an idol.
4. Train an idol.
5. Confirm idol stats increase correctly.
6. Confirm idol tier updates correctly.
7. Form a group.
8. Assign group roles.
9. Confirm Maknae is automatically identified.
10. Adjust income distribution.
11. Confirm distribution totals 100%.
12. Attempt to adjust distribution during production.
13. Confirm adjustment is blocked.
14. Remove an idol from a group.
15. Confirm the idol retains stats.
16. Confirm the six-month cooldown.
17. Remove an idol from the company.
18. Confirm the idol is permanently removed.
19. Confirm company reputation decreases.
20. Confirm group loyalty decreases.
21. Produce an album.
22. Confirm production progress.
23. Release an album.
24. Confirm sales begin.
25. Confirm sales last 10 real-time minutes.
26. Confirm sales progress while the game is open.
27. Refresh the page during sales.
28. Confirm offline progress is calculated.
29. Confirm sales are not duplicated.
30. Plan activities for multiple days.
31. Confirm multiple activities can be assigned to the same day.
32. Confirm there is no fixed four-activity daily limit.
33. Confirm incompatible activities are prevented.
34. Confirm activities are processed on their assigned days.
35. Confirm stamina and fatigue update correctly.
36. Advance one week.
37. Confirm all seven days are simulated in chronological order.
38. Confirm completed activities are not processed twice.
39. Confirm the weekly summary reflects actual activities.
40. Confirm the next week's planner is available.
41. Save the game.
42. Refresh the page.
43. Load the game.
44. Confirm all state is preserved.
45. Export a save.
46. Import the save.
47. Confirm invalid saves are rejected.
48. Build the project.
49. Deploy to GitHub Pages.
50. Confirm the deployed game works without a backend.



\---



\# 37. IMPORTANT DEVELOPMENT RULES



Follow these rules throughout implementation.



1\. Build a real playable game.

2\. Do not create a static mockup.

3\. Do not create buttons that do nothing.

4\. Do not use placeholder functionality for completed systems.

5\. Do not omit major systems from the specification.

6\. Do not invent unnecessary complexity.

7\. Do not add selectable difficulty.

8\. Do not implement online AI features.

9\. Do not implement real-money purchases.

10\. Do not implement awards or achievements in the initial version.

11\. Do not implement subunits in the initial version.

12\. Do not allow company removal to return an idol to the trainee roster.

13\. Do not allow idols to bypass the six-month cooldown.

14\. Do not allow income distribution changes during active production or promotion.

15\. Do not allow invalid schedule assignments.

16\. Do not allow duplicated album sales.

17\. Do not calculate idol tiers using arbitrary thresholds.

18\. Use the exact specified idol tier ranges.

19\. Keep the game completely offline.

20\. Keep all major gameplay calculations centralized.

21\. Make all balance values configurable.

22\. Save the game consistently.

23\. Provide clear player feedback.

24\. Ensure GitHub Pages compatibility.



\---



\# 38. FINAL DELIVERABLE



Create the complete React application.



The final result should include:



\- A fully playable K-pop Idol Tycoon game.

\- A polished pixel-inspired desktop interface.

\- Company creation.

\- Weekly game progression.

\- Company economy.

\- Company tiers.

\- Company reputation.

\- Company upgrades.

\- Auditions.

\- Idol recruitment.

\- Idol profiles.

\- Idol training.

\- Idol tiers.

\- Idol personalities.

\- Idol potential.

\- Contracts.

\- Group management.

\- Solo artist management.

\- Group roles.

\- Automatic Maknae identification.

\- Idol removal.

\- Company removal.

\- Group disbandment.

\- Loyalty.

\- Income distribution.

\- Clothing.

\- Album production.

\- Trends.

\- Album sales.

\- Offline sales progress.

\- Daily schedules.

\- Concerts.

\- Tours.

\- Fanbase.

\- News.

\- Random events.

\- Statistics.

\- Weekly reports.

\- Local save/load.

\- Export/import.

\- GitHub Pages compatibility.



Provide the complete source code.



Do not respond with only an explanation of how to build the game.



Do not provide pseudocode in place of the implementation.



Do not omit files required for the application to run.



If the implementation is too large to generate in one response, build it in stages while maintaining the existing project files and architecture.



Do not restart the project unnecessarily.



When continuing in later responses, preserve all previously implemented systems.



\---



\# 39. FIRST ACTION



Begin by inspecting the current Google AI Studio project.



If the project is empty:



1\. Set up the React application.

2\. Establish the game architecture.

3\. Create the central game state.

4\. Implement the initial company creation screen.

5\. Implement the dashboard.

6\. Implement the weekly clock.

7\. Implement the Next Week button.

8\. Implement the starting economy.

9\. Implement LocalStorage persistence.

10\. Verify that the application runs.



If the project already contains code:



\- Inspect the existing files.

\- Preserve working functionality.

\- Reuse the existing architecture where appropriate.

\- Do not overwrite unrelated work.

\- Identify missing systems.

\- Continue development from the current state.



Before declaring the game complete, verify that the main gameplay systems are connected and functional.



\*\*The priority is a playable, stable, offline management simulator with a clean foundation that can be expanded into future versions of K-pop Idol Tycoon.\*\*

