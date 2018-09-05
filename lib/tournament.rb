class Tournament < ActiveRecord::Base
  validates :date, presence: true
  validates :entry_fee, presence: true
  validates :level, presence: true 
end
